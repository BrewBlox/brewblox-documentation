# Publishing service data

Brewblox services typically involve sensors, and will constantly generate data.
In order for the system to make use of this data, services must be able to push it without being prompted by a REST request.

## Eventbus

To avoid tight integration between publishers and consumers of service data, broadcasting is done using a RabbitMQ eventbus.

Services can freely publish their data to a constant address, without having to be aware of who (if anyone) is listening.

This goes both ways: listeners are subscribed to events broadcast to an address.
They do not need to know anything about the service that published the data.

Events are published using the [MQTT protocol](https://randomnerdtutorials.com/what-is-mqtt-and-how-it-works/).

## Eventbus address

MQTT can use TCP or websockets as transport layer.

The eventbus is only accessible for TCP connections from inside the Brewblox network.

The eventbus host name is always `eventbus`. It listens for MQTT messages on port 1883.

```bash
# Inside the network
mqtt://eventbus:1883
```

If your publishing device or service is outside the network, you can open a websocket connection with <HOST>:<HTTPS_PORT>/eventbus. It will be forwarded to the eventbus by the Traefik gateway.

Do note that you have to enable SSL/TLS. If you are using a self-signed certificate (the default), you'll have to disable certificate verification.

```bash
# Outside the network
wss://HOST:443/eventbus
```

## History vs. State

In most scenarios, there are two reasons for services to continuously broadcast their current state:

- The data is to be stored in a history database, and can later be retrieved for analytics.
- The data is to be immediately and continuously processed.

On the face of it, these two purposes are very similar.
There are, however, some requirements that dictate separate implementations.

## History

Every published event of history data will be stored for later retrieval and analysis.
At time of writing, [InfluxDb](https://www.influxdata.com/) is used as history database.
For the purpose of publishing data, this is not very important.

What is important is how data should be formatted, and where it must be sent.

### Publishing history data

History data should be published to a topic starting with `brewcast/history`. <br>
`brewcast/history` and `brewcast/history/device-name` are both fine.
Everything after `brewcast/history` is ignored.


### History data formatting

The payload for history events must be a JSON serialized object, with as schema:

```python
{
    'key': str;
    'data': dict;
}
```

For example:

```python
{
    'key': 'my-device',
    'data': {
        'sensor1': 10,
        'sensor2': {
            'value1': 50,
            'value2': 123,
        }
    }
}
```

The data is flattened before it is inserted into the database.
The `key` field is considered the data source name, and becomes the InfluxDB measurement name.

The `data` field is flattened.
The key to all values is set as a /-separated path that includes the key of all parent objects.

If we receive this event:

```python
{
    'key': 'controller1',
    'data': {
        'block1': {
            'sensor1': {
                'settings': {
                    'setting': 'setting'
                },
                'values': {
                    'value': 'val',
                    'other': 1
                }
            }
        }
    }
}
```

...the data will be flattened to:

```python
{
    'block1/sensor1/settings/setting': 'setting',
    'block1/sensor1/values/value': 'val',
    'block1/sensor1/values/other': 1
}
```

### History data sanitation

Services are expected to sanitize data before publishing.
**Any non-numerical values will be set to NULL in the history database**. Remove these values beforehand to prevent empty columns.

## State

Published state data is expected to be consumed immediately. An optional validity duration can be provided to help caching.

### Publishing state

State data should be published to a topic starting with `brewcast/state`.
Everything after `brewcast/state` is ignored by clients.

### State data formatting

Event data must be a serialized JSON object, with the following schema:

``` python
{
    'key': str,
    'type': str,
    'ttl': str,
    'data': Or(dict, list),
}
```

**key** is the identifier for the data origin.
Typically this will be the name of your service. 
If your service is publishing multiple sets of data, feel free to use unique keys for each variant.

**type** is the identifier for the type of data.
Typically this will be the type of your service.
An example use of this value is service autodiscovery in the UI.

**ttl** is a string indicating for how long this state snapshot will remain valid.
Values will likely be parsed by [pytimeparse](https://github.com/wroberts/pytimeparse) or [parse-duration](https://github.com/jkroso/parse-duration), but this is not guaranteed.
Stick with simple formats such as '1min' or '60s' to be safe.

**data** is the actual state data. This can either be a list, or an object.


## Summary

* Connect
  * Inside network: **mqtt://eventbus:1883**
  * Outside network: **wss://HOSTNAME:443/eventbus**
* History data
  * Topic: **brewcast/history**
  * Required message fields: **key**, **data**
  * Remove non-number values
* State data
  * Topic: **brewcast/state**
  * Required message fields: **key**, **type**, **ttl**, **data**
