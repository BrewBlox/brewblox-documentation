# Sharing the Traefik Proxy

## Use case

Brewblox uses a [Traefik](https://docs.traefik.io/) gateway to let multiple services be publicly accessible on the same host port.

This works fine, but if you decide you want a secondary Traefik container
to do the same for other non-Brewblox services on your computer, you run into problems.

Traefik service discovery is an issue, and port sharing is (again) an issue.

## Requirements

- System includes an active and accessible Brewblox system.
- System includes one or more non-Brewblox containers.
- Both Brewblox and non-Brewblox containers are accessible on port 80/443.
- Top-level routing is based on hostname.
- Brewblox has a dedicated hostname.
- Hostname routing logic is extensible: 2..N hostnames must be recognized as routing rules.

## Brewblox routing

We'll start with the routing rules required for Brewblox,
and then extend to include other hosts.

Referenced compose configuration should be implemented in `docker-compose.yml`.
It will override the default configuration in `docker-compose.shared.yml`.

## Traefik service configuration

If you check `brewblox/docker-compose.shared.yml`, you'll find the `traefik` service configuration:

```yaml
  traefik:
    image: traefik:2.10
    restart: unless-stopped
    labels:
      - traefik.http.routers.api.rule=PathPrefix(`/api`) || PathPrefix(`/dashboard`)
      - traefik.http.routers.api.service=api@internal
      - traefik.http.middlewares.prefix-strip.stripprefixregex.regex=/[^/]+
      - traefik.http.middlewares.auth.forwardauth.address=http://auth:5000/auth/verify
      - traefik.http.middlewares.cors.headers.AccessControlAllowMethods=CONNECT,HEAD,GET,DELETE,OPTIONS,PATCH,POST,PUT,TRACE
      - traefik.http.middlewares.cors.headers.accessControlAllowOriginListRegex=.*
      - traefik.http.middlewares.cors.headers.AccessControlAllowCredentials=true
      - traefik.http.middlewares.cors.headers.AccessControlAllowHeaders=Origin,X-Requested-With,Content-Type,Accept
    volumes:
      - type: bind
        source: ./traefik
        target: /config
        read_only: true
      - type: bind
        source: /var/run/docker.sock
        target: /var/run/docker.sock
      - type: bind
        source: /etc/localtime
        target: /etc/localtime
        read_only: true
    ports:
      - "${BREWBLOX_PORT_HTTP}:${BREWBLOX_PORT_HTTP}"
      - "${BREWBLOX_PORT_HTTPS}:${BREWBLOX_PORT_HTTPS}"
      - "${BREWBLOX_PORT_MQTT}:${BREWBLOX_PORT_MQTT}"
      - "${BREWBLOX_PORT_MQTTS}:${BREWBLOX_PORT_MQTTS}"
      - "127.0.0.1:${BREWBLOX_PORT_ADMIN}:${BREWBLOX_PORT_ADMIN}"
    environment:
      - TRAEFIK_API_DASHBOARD=true
      - TRAEFIK_PROVIDERS_DOCKER=true
      - TRAEFIK_PROVIDERS_DOCKER_CONSTRAINTS=LabelRegex(`com.docker.compose.project`, `${COMPOSE_PROJECT_NAME}`)
      - TRAEFIK_PROVIDERS_DOCKER_DEFAULTRULE=PathPrefix(`/{{ index .Labels "com.docker.compose.service" }}`)
      - TRAEFIK_PROVIDERS_FILE_DIRECTORY=/config
      - TRAEFIK_ENTRYPOINTS_WEBSECURE_ADDRESS=:${BREWBLOX_PORT_HTTPS}
      - TRAEFIK_ENTRYPOINTS_WEBSECURE_HTTP_TLS=true
      - TRAEFIK_ENTRYPOINTS_WEBSECURE_HTTP_MIDDLEWARES=cors,auth
      - TRAEFIK_ENTRYPOINTS_WEB_ADDRESS=:${BREWBLOX_PORT_HTTP}
      - TRAEFIK_ENTRYPOINTS_WEB_HTTP_REDIRECTIONS_ENTRYPOINT_TO=websecure
      - TRAEFIK_ENTRYPOINTS_ADMIN_ADDRESS=:${BREWBLOX_PORT_ADMIN}
      - TRAEFIK_ENTRYPOINTS_ADMIN_HTTP_MIDDLEWARES=cors
      - TRAEFIK_ENTRYPOINTS_MQTT_ADDRESS=:${BREWBLOX_PORT_MQTT}/tcp
      - TRAEFIK_ENTRYPOINTS_MQTTS_ADDRESS=:${BREWBLOX_PORT_MQTTS}/tcp
```

This is a big blob of configuration at once, so we'll go through it section by section.

```yaml
    labels:
      - traefik.http.routers.api.rule=PathPrefix(`/api`) || PathPrefix(`/dashboard`)
      - traefik.http.routers.api.service=api@internal
      - traefik.http.middlewares.prefix-strip.stripprefixregex.regex=/[^/]+
      - traefik.http.middlewares.auth.forwardauth.address=http://auth:5000/auth/verify
      - traefik.http.middlewares.cors.headers.AccessControlAllowMethods=CONNECT,HEAD,GET,DELETE,OPTIONS,PATCH,POST,PUT,TRACE
      - traefik.http.middlewares.cors.headers.AccessControlAllowOriginListRegex=.*
      - traefik.http.middlewares.cors.headers.AccessControlAllowCredentials=true
      - traefik.http.middlewares.cors.headers.AccessControlAllowHeaders=Origin,X-Requested-With,Content-Type,Accept
```

The two labels starting with `traefik.http.routers.api` are for the Traefik dashboard, hosted at `<ADDRESS>/dashboard/`.

`traefik.http.middlewares.prefix-strip.stripprefixregex.regex=/[^/]+`
is a reusable middleware for routing a public path with a prefix to a private path without a prefix.

`traefik.http.middlewares.cors.(...)` headers contain access control
and [Cross-Origin Resource Sharing (CORS)](https://aws.amazon.com/what-is/cross-origin-resource-sharing/) configuration.
For Brewblox this is set very permissive, as the origin (server address) is different for every installation.

```yaml
    volumes:
      - type: bind
        source: ./traefik
        target: /config
        read_only: true
      - type: bind
        source: /var/run/docker.sock
        target: /var/run/docker.sock
      - type: bind
        source: /etc/localtime
        target: /etc/localtime
        read_only: true
```

The used SSL certs are placed in `./traefik`, along with a `traefik-cert.yaml` configuration file.

`/var/run/docker.sock:/var/run/docker.sock` allows access to the Docker socket.
This is required in order to autodetect active Docker containers.

`/etc/localtime` is mounted to make sure the container uses the same time and timezone settings as the host.

```yaml
    ports:
      - "${BREWBLOX_PORT_HTTP}:${BREWBLOX_PORT_HTTP}"
      - "${BREWBLOX_PORT_HTTPS}:${BREWBLOX_PORT_HTTPS}"
      - "${BREWBLOX_PORT_MQTT}:${BREWBLOX_PORT_MQTT}"
      - "${BREWBLOX_PORT_MQTTS}:${BREWBLOX_PORT_MQTTS}"
      - "127.0.0.1:${BREWBLOX_PORT_ADMIN}:${BREWBLOX_PORT_ADMIN}"
```

The `BREWBLOX_PORT_XXXX` variables are defined in the `brewblox/.env` file.
The default values are set during installation.

The admin port is special: it is a non-authenticated HTTP port that is only accessible from the server itself.
This port is used by `brewblox-ctl` during installation and updates.

There are quite a few arguments in the `environment:` section.
We'll look at it a few lines at a time.

```yaml
      - TRAEFIK_API_DASHBOARD=true
```

This enables the Traefik dashboard at `/dashboard/` (the trailing `/` is required).

```yaml
      - TRAEFIK_PROVIDERS_DOCKER=true
      - TRAEFIK_PROVIDERS_DOCKER_CONSTRAINTS=LabelRegex(`com.docker.compose.project`, `${COMPOSE_PROJECT_NAME}`)
      - TRAEFIK_PROVIDERS_DOCKER_DEFAULTRULE=PathPrefix(`/{{ index .Labels "com.docker.compose.service" }}`)
```

`TRAEFIK_PROVIDERS_DOCKER` enables Traefik scanning the Docker socket for active containers.

To avoid trying to route to any and all containers on the host, we add constraints.
Docker-compose sets the `com.docker.compose.project` label on managed containers.
The value equals that of the `COMPOSE_PROJECT_NAME` that is set in the `brewblox/.env` file.

The default routing rule for Brewblox services is to use the service name as prefix.
eg. `<ADDRESS>/spark-one/blocks` should be routed to the `spark-one` service.
We can get service name from another container label set by docker-compose: `com.docker.compose.service`.

```yaml
      - TRAEFIK_PROVIDERS_FILE_DIRECTORY=/config
```

`/config` is a mounted volume that leads to `brewblox/traefik`.
There's a configuration file and SSL certificates in there.

```yaml
      - TRAEFIK_ENTRYPOINTS_WEBSECURE_ADDRESS=:${BREWBLOX_PORT_HTTPS}
      - TRAEFIK_ENTRYPOINTS_WEBSECURE_HTTP_TLS=true
      - TRAEFIK_ENTRYPOINTS_WEBSECURE_HTTP_MIDDLEWARES=cors,auth
      - TRAEFIK_ENTRYPOINTS_WEB_ADDRESS=:${BREWBLOX_PORT_HTTP}
      - TRAEFIK_ENTRYPOINTS_WEB_HTTP_REDIRECTIONS_ENTRYPOINT_TO=websecure
      - TRAEFIK_ENTRYPOINTS_ADMIN_ADDRESS=:${BREWBLOX_PORT_ADMIN}
      - TRAEFIK_ENTRYPOINTS_ADMIN_HTTP_MIDDLEWARES=cors
      - TRAEFIK_ENTRYPOINTS_MQTT_ADDRESS=:${BREWBLOX_PORT_MQTT}/tcp
      - TRAEFIK_ENTRYPOINTS_MQTTS_ADDRESS=:${BREWBLOX_PORT_MQTTS}/tcp
```

There are five entrypoints:

- `websecure`
- `web`
- `admin`
- `mqtt`
- `mqtts`

`websecure` is the primary user-facing entrypoint. HTTPS and authentication are both enabled.

`web` is a HTTP entrypoint that immediately redirects requests to `websecure`.
Without it, you would get an error when visiting `http://{address}`.

`admin` is a HTTP entrypoint used by `brewblox-ctl`. To keep it safe, it is only accessible from the server itself (ie. bound to `127.0.0.1` in `ports:`).

`mqtt` and `mqtts` are directly forwarded to the MQTT eventbus.

## Traefik dashboard

You can check the Traefik dashboard by navigating to `<ADDRESS>/dashboard/`.
The trailing `/` is required.

Here you'll see all Routers, Services, and Middlewares that are currently active.

For a detailed explanation of how these interact, you can check [this Traefik documentation page](https://docs.traefik.io/routing/overview/).

## Other Brewblox services

Traefik allows for a number of shortcuts:

- A Traefik Router is automatically added if you declare a Traefik Service.
- You only need to specify a target port on your service if multiple ports are exposed.

The `traefik` service includes a default setting for the routing rule.

If you check `docker-compose.shared.yml`, you'll find:

```yaml
  eventbus:
    ...
    labels:
      # MQTT
      - traefik.tcp.routers.mqtt.entrypoints=mqtt
      - traefik.tcp.routers.mqtt.rule=HostSNI(`*`)
      - traefik.tcp.routers.mqtt.tls=false
      - traefik.tcp.routers.mqtt.service=mqtt
      - traefik.tcp.services.mqtt.loadBalancer.server.port=1883
      # MQTTS with TLS termination by traefik
      - traefik.tcp.routers.mqtts.entrypoints=mqtts
      - traefik.tcp.routers.mqtts.rule=HostSNI(`*`)
      - traefik.tcp.routers.mqtts.tls=true
      - traefik.tcp.routers.mqtts.service=mqtts
      - traefik.tcp.services.mqtts.loadBalancer.server.port=1884
      # MQTT over websockets
      - traefik.http.services.eventbus.loadbalancer.server.port=15675

  victoria:
    ...
    labels:
      - traefik.http.services.victoria.loadbalancer.server.port=8428

  redis:
    ...
    labels:
      - traefik.enable=false

  ui:
    ...
    labels:
      - traefik.http.routers.ui.rule=PathPrefix(`/ui`) || PathPrefix(`/static`) || Path(`/`)
```

Notes:

- `eventbus` and `victoria` have multiple published ports, so we need to be specific.
- `redis` is not accessible through the gateway.
- `ui` has a custom routing rule: if you go to `<Address>:<Port>`, you will be routed to the UI service.

So much for the default settings. Time for change!

## Adding DNS hostnames

Let's add another service: `webby`.
We want to be routed to `webby` if we navigate to `webby.local`.

First, we want the `webby.local` address to point to our host.
A permanent solution is to add an entry in the router DNS records,
but for now we can use `avahi-publish` to temporarily add DNS-SD records.

Open two terminal windows, and run (one command in each):

```sh
avahi-publish -a -R brewblox.local $(hostname -I | cut -d' ' -f1)
```

```sh
avahi-publish -a -R webby.local $(hostname -I | cut -d' ' -f1)
```

Leave the terminal windows open. The records disappear when you close the running process.

Now, if we navigate to either `https://webby.local` or `https://brewblox.local`, we end up in the Brewblox UI.

## Host-based routing

Now, add the actual `webby` service to docker-compose.yml.
We'll keep it simple, and use the default Nginx image.

We want `webby.local` to go to `webby`, and `brewblox.local` to go to the Brewblox UI.

```yaml
  webby:
    image: nginx
    labels:
      - traefik.http.routers.webby.rule=Host(`webby.local`)
      - traefik.http.routers.webby.priority=9001
```

Now, if you go to `brewblox.local`, you'll end up at `https://brewblox.local/ui/dashboard/dashboard-home`,
and if you go to `webby.local`, you get the Nginx welcome message.

## Multi-project routing

If you don't want `webby` to be defined in brewblox/docker-compose.yml,
you will need to set up a shared Docker network so the Traefik router can reach `webby`.

See the [docker-compose documentation](https://docs.docker.com/compose/networking/#specify-custom-networks) for how to set up custom networks.

You will also need to change or remove the provider constraint for the `traefik` service.

Currently, it is:

```yaml
  traefik:
    ...
    environment:
      ...
      - TRAEFIK_PROVIDERS_DOCKER_CONSTRAINTS=LabelRegex(`com.docker.compose.project`, `${COMPOSE_PROJECT_NAME}`)
      ...
```

To add the `webby` project, you can modify the value to:

```go
LabelRegex(`com.docker.compose.project`, `(${COMPOSE_PROJECT_NAME}|webby)`)
```

If you want all containers on the host to be managed by traefik, you can completely remove the `TRAEFIK_PROVIDERS_DOCKER_CONSTRAINTS` argument.

Note that you can't partially override the `traefik` service `environment`.
If you want to change one argument, you'll have to copy and include all other arguments.

Run `docker-compose config` afterwards to check the merged result.
