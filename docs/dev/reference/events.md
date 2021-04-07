# Publishing service events

Brewblox services typically involve sensors, and will constantly generate data.
In order for the system to make use of this data, services must be able to push it without being prompted by a REST request.

## Eventbus

To avoid tight integration between publishers and consumers of service data, broadcasting is done using a broker.

Services can freely publish their data to a constant address, without having to be aware of who (if anyone) is listening.

This goes both ways: listeners are subscribed to events broadcast to an address.
They do not need to know anything about the service that published the data.

Events are published using the [MQTT protocol](https://randomnerdtutorials.com/what-is-mqtt-and-how-it-works/).

## Eventbus address

MQTT can use TCP or websockets as transport layer.

TCP can only be used from inside a Brewblox network.

The eventbus hostname is always `eventbus`. It listens for MQTT messages on port 1883.

```bash
# Inside the network
mqtt://eventbus:1883
```

If your publishing device or service is outside the network, you can open a websocket connection to `<HOST>:443/eventbus`, where *HOST* is the address of the Pi running Brewblox. It will be forwarded to the eventbus by the Traefik gateway.

When using websockets, you have to enable SSL/TLS. If you are using a self-signed certificate (the default), you'll have to disable certificate verification.

You'll want to make the port configurable. It must match the Traefik HTTPS port (default: 443), which can be changed by users.

```bash
# Outside the network
wss://HOST:443/eventbus
```

## History vs. State

In most scenarios, there are two reasons for services to continuously broadcast data:

- The values are to be stored in a history database, and can later be retrieved for analytics. Data is cumulative.
- The values are to be immediately rendered. Data is volatile, and replaces the previous message.

History data must conform to a common [spec](./history_events), as it is consumed by the shared history service.

State data is more comprehensive and volatile than history data.
There naturally is more variation in formatting.

To avoid pollution of the eventbus topic space, we reserved the `brewcast/state` topic. For more information, see the [state event spec](./state_events).

[See here](./spark_state) for a reference as to how Spark service state is published.
