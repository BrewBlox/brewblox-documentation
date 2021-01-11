# Publishing history data

Services commonly generate sensor data that should be stored in a Time-Series Database (TSDB).
Brewblox uses [InfluxDb](https://www.influxdata.com/) as its TSDB for history data, and [MQTT events](./events) as publisher protocol.

The `history` service acts as database interface layer for both publishing and querying data.

This document describes the topic and payload formatting required to publish events that can be consumed by the history service.

## Topic

The history service is subscribed to `brewcast/history/#`.
This means that events should be published to a topic starting with `brewcast/history`.

::: tip
For debugging purposes, we recommend to append the service name to the topic.
You can then use an MQTT client to subscribe to eg. `brewcast/history/my-service`, and avoid noise from unrelated other services.
:::

## Flags

You can use any valid value for the `qos` flag in MQTT.

Do not set the `retain` flag. It will cause the history service to repeatedly save the same data point, using different timestamps.

## Payload

The payload for history events must be a JSON serialized object, with as schema:

```json
{
  "type": "object",
  "properties": {
    "key": {
      "type": "string"
    },
    "data": {
      "type": "object"
    }
  },
  "required": [
    "key",
    "data"
  ],
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```

For example:

```json
{
    "key": "my-device",
    "data": {
        "sensor1": 10,
        "sensor2": {
            "value1": 50,
            "value2": 123,
        }
    }
}
```

The data is flattened before it is inserted into the database.
The `key` field is considered the data source name, and becomes the InfluxDB measurement name.

The `data` field is flattened.
The key to all values is set as a /-separated path that includes the key of all parent objects.

The data in this event...

```json
{
    "key": "controller1",
    "data": {
        "block1": {
            "sensor1": {
                "settings": {
                    "setting": "setting"
                },
                "values": {
                    "value": "val",
                    "other": 1
                }
            }
        }
    }
}
```

...is flattened to:

```json
{
    "block1/sensor1/settings/setting": "setting",
    "block1/sensor1/values/value": "val",
    "block1/sensor1/values/other": 1
}
```

::: warning
Services are expected to sanitize data before publishing.
**Any non-numerical values will be set to NULL in the history database**. Remove these values beforehand to prevent empty columns.
:::
