# Service routing

When using or developing Brewblox services, you'll probably call on the API of another service.
To do so, it is important to understand how routing and hostnames are handled in a typical setup.

## Big picture

The Docker containers in which the services run are all connected to a shared [Docker bridge network](https://docs.docker.com/network/bridge/).
Services can see other services, but clients outside the network can't access services.

To be accessible by external clients, services can [publish ports](https://docs.docker.com/compose/compose-file/compose-file-v3/#ports) on the host.

Because we want multiple services to share a port (http 80 and https 443), Brewblox uses a [Traefik reverse proxy](https://doc.traefik.io/traefik/).
The proxy forwards incoming requests to the relevant service. By default, routing rules are based on service name, but services can customize or disable this.

## Bridge network

Unless explicitly [specified otherwise](https://docs.docker.com/network/host/), all services listed in `docker-compose.yml` and `docker-compose.shared.yml` share the same Docker bridge network.

DNS entries are added to all services for all other services. The DNS host equals the service name.

If you want to use the REST API of Spark service `spark-one` from the context of your own service, you can find the Spark service at `http://spark-one:5000`, with `5000` being the default API port.

If you are using an external client (curl, Postman, `brewblox-ctl http`), `http://spark-one:5000` will return a "host not found" error.

## Proxy and route prefixes

The Traefik proxy (service `traefik`) publishes HTTP and HTTPS ports on the host, and redirects incoming traffic to the relevant service.

There are some exceptions, but the default routing rule is that the request path starts with the service name.
The API endpoints for the `spark-one` service all start with `/spark-one/`.

From your own service, you can technically use both `http://spark-one:5000/spark-one` and `http://{HOST}:80/spark-one`, but the latter is discouraged because users can redefine the public HTTP/HTTPS ports.

Because TLS termination is handled in the proxy, `http://{HOST}:80/spark-one/XXXXXXX` and `https://{HOST}:443/spark-one/XXXXXXX` are both valid, but `https://spark-one:5000/spark-one/XXXXXXX` is not.

## Eventbus

The MQTT eventbus is reachable using two transport protocols: TCP and Websockets.
Websockets are routed through traefik using the default rules (`http://{HOST}/eventbus`), but the 1883 MQTT TCP port is published by the eventbus itself.

Again, for other services it is recommended to use `mqtt://eventbus:1883`, as the host MQTT port is user-configurable.

## mDNS

Multicast Domain Name System (mDNS) helps to resolve host names in the LAN network, but is not relevant to the Docker bridge network.

You can find `{HOST}` using mDNS, but `http://spark-one` will always be resolved by DNS entries provided by Docker networking.
