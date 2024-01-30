# Replacing RabbitMQ

Date: 2020/06/06

## Summary

- RabbitMQ misses required features, and will be replaced.
- A three-month deprecation period will be used.
- As a temporary solution, the history service provides a Last Value Cache.
- Alternative brokers will be evaluated during the deprecation period.

## Context

[This previous decision](./20200530_mqtt_events.md) describes the switch from AMQP to MQTT as eventbus protocol.

Implementation of a Last Value Cache (LVC) for new subscribers was marked as "further work".
MQTT natively supports LVC behavior by means of the [retain flag](https://www.hivemq.com/blog/mqtt-essentials-part-8-retained-messages/).

The problem is that RabbitMQ [does not properly support retained messages](https://github.com/rabbitmq/rabbitmq-mqtt/issues/154).

To quote the latest reply from a RabbitMQ dev:

> It has not been. Unless someone would be interested in contributing (this is a fairly non-trivial task, although much smaller if limited to an in-memory implementation), this is unlikely to be addressed soon because there are much higher priority items for the core team, even in this plugin alone.
>
> <cite>michealklishin, 2020/04/22</cite>

As we have no plans to continue using AMQP, the long-term solution seems to be to replace the eventbus provider.

## Considerations

The obvious change in functionality is that if we remove support for AMQP events, we break all services that publish history data over AMQP.

We can migrate our own services in the same release that implements MQTT publishing, so they won't be affected.
That leaves third-party and local publishers. We coordinate where we can, but are unlikely to be aware of all of them.

A deprecation period where both AMQP and MQTT are supported is the most practical approach.

The public API for MQTT in the eventbus is:

- mqtt://eventbus:1883 (inside Brewblox network)
- ws://eventbus:15675/eventbus (inside Brewblox network)
- wss://HOST_ADDRESS:443/eventbus (outside Brewblox network)

The third address (wss) is proxied by Traefik towards the second (ws).
Port and address used for WS is configured in docker-compose.shared.yml.
Updating these settings will not break configuration for external clients.

Support for using a `/eventbus` path in the broker is desirable.
It simplifies the matrix of connection settings, and lets websocket connections always use the same path, regardless of whether they communicate with Traefik, or with the broker directly.

## Deprecation period

Given the active development of Brewblox, a three-month deprecation period seems reasonable.
This means that AMQP support will be removed in the first release that is more than three months after the release where MQTT is introduced.

## Temporary solution: cached state

Having to potentially wait 5s (broadcast interval Spark) before state is loaded is not something where we can delay the fix by three months.

A temporary fix is for the history service to cache the last state event for every key/type combination. After startup, the UI publishes an empty event to `brewcast/request/state`.
History responds to that event by re-publishing all cached state messages.

This solution is not optimal (all subscribers get the re-published state messages), but it is simple, and good enough for the expected use case of <10 simultaneously connected clients.

## Selecting a broker

A final decision on which broker to use can be postponed until the end of the deprecation period.
Initial testing with [mosquitto](https://mosquitto.org/) is promising: it consumes significantly less CPU/RAM than RabbitMQ, and starts near instantly.
We confirmed that mosquitto supports retained messages, but will also evaluate alternatives.
