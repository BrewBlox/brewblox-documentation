# Eventbus revisited: MQTT events

Date: 2020/05/30

## Context

Inter-service communication is done [using a combination of sync and async calls](./20180216_communication_options).

[Originally, we picked AMQP as async event protocol](./20180220_eventbus).
One of the requirements at the time was that the eventbus would only be used by interal services. This is no longer true.
It is common (and now even suggested in tutorials) to expose the 5672 RabbitMQ port on the host.

This calls for a re-evaluation as to how events are used.

## Event usage

There are currently two event specs, and three consumers.

**History** data is published by every device service, and consumed by the history service.

**State** data is published by the Spark and Automation services, and consumed by the Automation and Emitter services.
The latter serves as an AMQP -> SSE bridge, and keeps a cache of last published values.
SSE messages are consumed by the UI.

We're not aware of any third-party devices publishing State data.

There are some use cases where device services can't reside in the docker-compose network, but still wish to publish data.
These services may require a `--net=host` configuration, or reside on a different host altogether.

The Traefik gateway does not support proxying the AMQP protocol.
For these use cases, the solution was to expose the RabbitMQ 5672 port on the host itself, bypassing the Traefik gateway.

## Data publishing: evaluation

The event-based approach to publishing data works well.
It is the most common use case for third-party services, and easy to set up.
RabbitMQ as eventbus reliably Just Works. We have no reason to shop around for a different provider.

The use cases for publishing data from outside the compose network are valid. We want to explicitly support things like bluetooth / serial bridges that publish data to a more centralized Brewblox server.

Exposing additional ports on the host is not something we're happy with.
Long term plans include support for exposing Brewblox online, and additional ports significantly increase the attack surface.

The UI currently requires the Emitter service as bridge.
This service is relatively simple, but we want to limit the Brewblox footprint, and the disk usage for any new Python image is rather large.

## MQTT

The alternative protocol for event messages is MQTT / MQTT over websockets.
For a more detailed comparison, see: https://vasters.com/blog/From-MQTT-to-AMQP-and-back/.

For us, the relevant advantages are:
- MQTT over websockets can be proxied by Traefik.
- MQTT over websockets can be used in a web browser (the UI).
- Its wire protocol is somewhat lighter than AMQP.
- MQTT is natively supported by RabbitMQ.
- RabbitMQ offers interoperability between AMQP and MQTT events.


## Data formatting

AMQP has two settings that are used for addressing: exchange, and routing key. MQTT published to a fixed exchange, and only has a /-separated message topic.

This requires a breaking change for publishing history data, as it meaningfully uses both exchange (`brewcast.history`), and routing key (measurement name).

State data uses the exchange (`brewcast.state`), but could use any value as routing key. Metadata is included in the message itself.

The required schema is:
```json
{
  "type": "object",
  "properties": {
    "key": {
      "type": "string"
    },
    "type": {
      "type": "string"
    },
    "ttl": {
      "type": "string"
    },
    "data": {}
  },
  "required": [
    "data",
    "key",
    "ttl",
    "type"
  ],
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```

The proposed changes are:
- Message topics become the predefined const values `brewcast/history` and `brewcast/state`.
- History messages use a comparable schema to state messages. (the `ttl` field is not required).

During a deprecation period, the history service is subscribed both to the existing AMQP `brewcast.history` exchange, and the new MQTT `brewcast/history` topic.

## Changes

- The RabbitMQ web_mqtt endpoint is added as Traefik proxy backend.
- The UI subscribes to MQTT over WS messages from the eventbus.
- Device services publish history data using MQTT.
- The Automation service subscribes to MQTT events.
- The history service stays subscribed to the AMQP history spec for a deprecation period.
- The spec for publishing history messages is updated.
- AMQP support is removed from brewblox-service.
- MQTT support is added to brewblox-service.
- MQTT over WS support is added to brewblox-service.
- AMQP support is added to brewblox-history for the duration of the deprecation period.
- A preconfigured Docker image is used for RabbitMQ (`brewblox/rabbitmq`).
- The Emitter service is removed.
- Existing tutorials are updated to use MQTT over WS for publishing history.

## Further work

The UI directly subscribing to the eventbus causes a regression in functionality: the emitter service also served as Last Value Cache.
The UI will now first receive data when the source next publishes its state.

The likely implementation is for the UI to republishing of the last value.
Values are cached by either:
  - Every publishing service.
  - A new service.
  - An existing service (history?).
