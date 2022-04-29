# Service architecture

Brewblox is designed to be extensible. We want to make it easy to create, run, and share your custom scripts and services.

The [script tutorials](../tutorials/brewscript/) are intended to serve as example for the absolute minimum required to interact with Brewblox.
This is great when your desired functionality can be expressed using a single while loop and a hundred lines of code.

If you also want to include fault tolerance, REST endpoints, concurrent functionality, or Python package management,
then we also have the [brewblox-boilerplate](https://github.com/BrewBlox/brewblox-boilerplate) template repository.
This is what we use if we're setting up a new service.

Services created from the *brewblox-boilerplate*
template are based on the following frameworks:

- [asyncio](https://docs.python.org/3/library/asyncio.html) for writing concurrent code without threading.
- [aiohttp](https://docs.aiohttp.org/en/stable/) for easily setting up a REST API.
- [brewblox-service](https://github.com/BrewBlox/brewblox-service) for using Brewblox-specific functionality.

The boilerplate service includes examples for how to make use of this functionality,
but there are some underlying concepts and architectural decisions
that are useful to understand when you are implementing your own features.

This guide assumes you've checked out the example code in the *brewblox-boilerplate* repository,
and have a working knowledge of Python.

## Concurrent functionality

For most services, functionality is triggered by either:

- Data read from a serial port.
  - HTTP requests
  - MQTT events
  - USB devices
- A scheduled interval.

The first can be summarized as:

```python
while True:
    data = connection.read()
    do_stuff(data)
```

The second typically takes the shape of:

```python
while True:
    do_stuff()
    sleep()
```

We expect services to want to run multiple of these `while True` tasks concurrently.
*asyncio* provides the tooling and syntax for concurrency with `async/await`.
*brewblox-service* provides the library for setting up async tasks with the minimum amount of overhead.

## Service Features

At the core of the *aiohttp* framework is the `aiohttp.web.Application` object.
This object contains all stored data, and is passed around as argument to all handler functions.
You can think of it as some sort of global `self` object.

Typical behavior for a service is to create an `app` object ([brewblox_service.service:create_app()](https://github.com/BrewBlox/brewblox-service/blob/develop/brewblox_service/service.py)),
and then register event handlers and long-running tasks.

HTTP routes can be added directly (eg: [http_example.py](https://github.com/BrewBlox/brewblox-boilerplate/blob/develop/YOUR_PACKAGE/http_example.py) in *brewblox-boilerplate*).
More complex functionality can use the [brewblox_service.features.ServiceFeature](https://github.com/BrewBlox/brewblox-service/blob/develop/brewblox_service/features.py) base class, or its derivative: [brewblox_service.repeater.RepeaterFeature](https://github.com/BrewBlox/brewblox-service/blob/develop/brewblox_service/repeater.py).

These classes require you to implement lifecycle callback functions that will be called by the framework at the appropriate moment.
More on this below.

The vast majority of desired functionality that is independent from REST endpoints can and should be implemented as part of a Feature.

During the setup phase, you can call the `brewblox_service.features.add(app, MyFeature(app))` function to register your feature as part of the active Application.\
Features added with `features.add()` can later be retrieved with `features.get(app, type, key=None)`.
By default, features are indexed by class type, as in most use cases you only need one instance of each feature.

This behavior can be overridden by including the `key=` argument when calling `features.add()` and `features.get()`.

For example:

```python
def setup(app):
    features.add(app, ParallelFeature(app), key='parallel-one')
    features.add(app, ParallelFeature(app), key='parallel-two')

def get_one(app):
    return features.get(app, ParallelFeature, key='parallel-one')

def get_two(app):
    return features.get(app, ParallelFeature, key='parallel-two')
```

## The asyncio event loop

All applications using asyncio must start the event loop at some point,
and then let the event loop handle all async functions.
Before this point, the `async` / `await` syntax is not yet available.

In *brewblox-service*, the event loop starts in the `brewblox_service.service:run()` function.
This means all `ServiceFeature` constructors and `setup()` functions are called before the event loop starts.

The loop runs until a shutdown error is raised, or a SIGTERM signal is received. It will then cancel all running tasks, shut down the event loop, and then exit the application.

## Service lifecycle

It's inevitable that some setup code is async, and the concurrent nature of features may require some explicit teardown code.
For these use cases, `ServiceFeature` has three async lifecycle hooks:

- `async def startup(app)`
- `async def before_shutdown(app)`
- `async def shutdown(app)`

A typical example is to subscribe to MQTT events during startup, and to unsubscribe again during shutdown.

```python
class SubscribingFeature(features.ServiceFeature):

    def __init__(app: web.Application):
        super().__init__(app)
        self.topic = 'brewcast/history/#'

    async def startup(self, app: web.Application):
        await mqtt.listen(app, self.topic, self.on_message)
        await mqtt.subscribe(app, self.topic)

    async def shutdown(self, app: web.Application):
        await mqtt.unsubscribe(app, self.topic)
        await mqtt.unlisten(app, self.topic, self.on_message)

    async def on_message(self, topic: str, message: dict):
        print(topic, message)

def setup(app: web.Application):
    features.add(app, SubscribingFeature(app))
```

This is a fully functional example. Call the `setup()` function during setup,
and this feature will keep responding to MQTT events until the application is shut down.

Here, the feature receives a callback if data is available. The other common use cases are to actively check for new data, or to do X every Y seconds.

You don't want to place a `while True` loop in `startup()`.
All startup functions must be completed before the service starts listening for HTTP requests.

To handle the overhead of starting and stopping a `while True` task that runs until the service shuts down, we have a subclass of `ServiceFeature`: `RepeaterFeature`.

`RepeaterFeature` implements the `startup()` and `shutdown()` functions,
and adds two new abstract functions: `prepare()` and `run()`.

`prepare()` is called once after startup.
`run()` is called afterwards in a loop.

Simplified, this would look like:

```python
async def startup(self, app):
    # asyncio.create_task() returns immediately
    # self.__run() now runs in the background
    asyncio.create_task(self.__run())

async def __run(self):
    await self.prepare()
    while True:
        await self.run()
```

Example:

```python
class CountingFeature(repeater.RepeaterFeature):

    async def prepare(self):
        self.count = 0
        self.topic = 'count/that/thoughts'

    async def run(self):
        self.count += 1
        await mqtt.publish(self.app,
                           self.topic,
                           {'count': self.count})
        await asyncio.sleep(10)


def setup(app: web.Application):
    features.add(app, CountingFeature(app))
```

This example will increment `self.count` every 10 seconds, and publish the number.
It stops automatically when the application stops,
and will catch raised errors.

Because `asyncio.sleep()` is async, other code can run while this feature sleeps.
