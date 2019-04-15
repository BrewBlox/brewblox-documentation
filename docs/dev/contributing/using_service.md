# Using brewblox-service functionality

After setting up a new service from the [boilerplate repository](https://github.com/brewblox/brewblox-boilerplate), you now have access to the shared functionality in `brewblox-service`.

## Registering features

[Aiohttp](https://aiohttp.readthedocs.io/en/stable/) revolves around its central `app` object. This object is passed around everywhere, and enables sharing settings without using a module-level object.

In `brewblox-service`, long-lived handlers are registered as `ServiceFeature` classes inside `app`. This allows them to be used by HTTP request handlers.

Features are useful for using shared state and references (configuration, open connections, etc). For example, the [brewblox_devcon_spark.commander](https://github.com/BrewBlox/brewblox-devcon-spark/blob/develop/brewblox_devcon_spark/commander.py) module matches responses to requests for Spark commands.

Features should be created before the service starts running `app`, and will receive callbacks on startup and shutdown. These callbacks are important because they are made after the service started running the async loop, and before the loop is stopped.

For code examples on how to use features, see [the docstrings](https://github.com/BrewBlox/brewblox-service/blob/develop/brewblox_service/features.py).


## Long-running tasks

A common use case for a service is to have a feature that does X every Y seconds, independent from any HTTP requests.

Some examples:
- [brewblox-devcon-spark](https://github.com/BrewBlox/brewblox-devcon-spark/blob/develop/brewblox_devcon_spark/broadcaster.py) reads controller blocks every few seconds, and then broadcasts the data to the eventbus (to be inserted in InfluxDB).
- [brewblox-devcon-spark](https://github.com/BrewBlox/brewblox-devcon-spark/blob/develop/brewblox_devcon_spark/api/sse_api.py) reads controller blocks every few seconds, and then writes the result to all active SSE connections.
- [brewblox-history](https://github.com/BrewBlox/brewblox-history/blob/develop/brewblox_history/influx.py) checks every few seconds whether it received new data points, and then inserts them all at once to the database.

For code examples on how to schedule tasks, see [the docstrings](https://github.com/BrewBlox/brewblox-service/blob/develop/brewblox_service/scheduler.py).

## Publishing data to InfluxDB

::: tip
If you want the data to be saved to your Influx database, you also need to run the following containers from the default BrewBlox configuration:
- eventbus (RabbitMQ)
- influx (InfluxDB)
- history (brewblox-history)
:::

Any service running in the BrewBlox docker-compose configuration can insert data in the history database by publishing it to the right RabbitMQ topic.
The history service listens to this topic, and inserts the data in the database.

See [the event logging spec](../reference/event_logging) for how to format data.

You can publish events by importing the `events` module from `brewblox-service`.
The module must be initialized by calling `events.setup(app)`.

``` python
# my_awesome_service/__main__.py

from brewblox_service import events, scheduler, service
from my_awesome_service import influxer

def main():
    app = service.create_app(default_name='my_awesome_service')

    # Both Influxer and event handling requires the task scheduler
    scheduler.setup(app)

    # Initialize event handling
    events.setup(app)

    # Initialize your feature
    influxer.setup(app)

    # Add all default endpoints
    service.furnish(app)

    # service.run() will start serving clients async
    service.run(app)

if __name__ == '__main__':
    main()
```

Now in your `influxer` module, you can publish your data.

```python
# my_awesome_service/influxer.py

import asyncio
from concurrent.futures import CancelledError
import time

from aiohttp import web
from brewblox_service import brewblox_logger, events, features, scheduler

LOGGER = brewblox_logger(__name__)


def setup(app: web.Application):
    features.add(app, Influxer(app))


class Influxer(features.ServiceFeature):

    def __init__(self, app: web.Application):
        super().__init__(app)
        self._task: asyncio.Task = None

    # We can start using async calls here
    async def startup(self, app: web.Application):
        self._task = await scheduler.create_task(app, self._run())

    # Cleanup before the service shuts down
    async def shutdown(self, app: web.Application):
        await scheduler.cancel_task(self.app, self._task)
        self._task = None

    # This function is run by the scheduler
    async def _run(self):
        name = self.app['config']['name'] # The unique service name
        publisher = events.get_publisher(self.app)
        
        LOGGER.info('Started Influxer')

        while True:
            try:
                # Async sleep calls will not block the rest of the service
                await asyncio.sleep(5)

                await publisher.publish(
                    exchange='brewcast', # brewblox-history listens to this exchange
                    routing=name,        # this will be the measurement name in influx
                    message={
                        'time': time.time(),
                    }
                )
                LOGGER.info('Published data')

            # This exception is raised when the task is cancelled (scheduler.cancel_task())
            # It means we're gracefully shutting down. No need to complain or log errors.
            except CancelledError:
                break

            # All other errors are still errors - something bad happened
            # Wait a second, and then continue running
            except Exception as ex:
                LOGGER.error(f'Encountered an error: {ex}')
                await asyncio.sleep(1)
```
