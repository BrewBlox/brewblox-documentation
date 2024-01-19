# Events: State

For any services with a remote client (UI), it is desirable to publish current service state and sensor readings.
This state tends to be a superset of the published history data, and may include non-numerical values.

We reserved topic space for these messages under `brewcast/state`.
Because detailed state data requires support from consuming clients, we do not define a global payload format for messages.

The payload schema for Spark state events can be found [here](./spark_state.md).

## Topic

Service state events should be published to a topic matching `brewcast/state/<Service ID>`. You should NOT publish directly to the `brewcast/state` topic.

GOOD:

- `brewcast/state/my-service-one`
- `brewcast/state/my-service-one/subtype`
- `brewcast/state/my-service-one/my-service/subtype`

BAD:

- `brewcast/state`
- `my-service`
- `my-service/my-service-one`

## Flags

You can use any valid value for the `qos` flag in MQTT.

It is common to set the `retain` flag for state events.
This allows quick synchronization with newly connected clients.

## Payload

Empty messages are used to clear [retained messages](https://www.hivemq.com/blog/mqtt-essentials-part-8-retained-messages/) set for a topic.

If a payload is set, it must be a JSON-serialized object.
There is no pre-defined schema for message payloads. Each service is free to define its own.
