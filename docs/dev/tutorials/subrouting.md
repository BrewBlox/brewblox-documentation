# Sharing the Traefik proxy

## Use case

Brewblox uses a [Traefik](https://docs.traefik.io/) gateway to let multiple services be publicly accessible on the same host port.

This works fine, but if you decide you want a secondary Traefik container
to do the same for other non-Brewblox services on your computer, you run into problems.

Traefik service discovery is an issue, and port sharing is (again) an issue.

## Requirements

- System includes an active and accessible Brewblox system.
- System includes one or more non-Brewblox containers.
- Both Brewblox and non-Brewblox containers are accessible on port 80/443.
- Top-level routing is based on host name.
- Brewblox has a dedicated host name.
- Host name routing logic is extensible: 2..N host names must be recognized as routing rules.

## Brewblox routing

We'll start with the routing rules required for Brewblox,
and then extend to include other hosts.

Referenced compose configuration should be implemented in `docker-compose.yml`.
It will override the default configuration in `docker-compose.shared.yml`.

## Traefik service configuration

If you check `brewblox/docker-compose.shared.yml`, you'll find the `traefik` service configuration:

```yaml
  traefik:
    image: traefik:2.2
    ports:
      - "${BREWBLOX_PORT_HTTP}:${BREWBLOX_PORT_HTTP}"
      - "${BREWBLOX_PORT_HTTPS}:${BREWBLOX_PORT_HTTPS}"
    labels:
      - traefik.http.routers.api.rule=PathPrefix(`/api`) || PathPrefix(`/dashboard`)
      - traefik.http.routers.api.service=api@internal
      - traefik.http.middlewares.prefix-strip.stripprefixregex.regex=/[^/]+
    volumes:
      - ./traefik:/config
      - /var/run/docker.sock:/var/run/docker.sock
    command: >-
      --api.dashboard=true
      --providers.docker=true
      --providers.docker.constraints="Label(`com.docker.compose.project`, `${COMPOSE_PROJECT_NAME}`)"
      --providers.docker.defaultrule="PathPrefix(`/{{ index .Labels \"com.docker.compose.service\" }}`)"
      --providers.file.directory=/config
      --entrypoints.web.address=:${BREWBLOX_PORT_HTTP}
      --entrypoints.web.http.redirections.entrypoint.to=websecure
      --entrypoints.websecure.address=:${BREWBLOX_PORT_HTTPS}
      --entrypoints.websecure.http.tls=true
```

This is a big blob of configuration at once, so we'll go through it section by section.

```yaml
    ports:
      - "${BREWBLOX_PORT_HTTP}:${BREWBLOX_PORT_HTTP}"
      - "${BREWBLOX_PORT_HTTPS}:${BREWBLOX_PORT_HTTPS}"
```

`BREWBLOX_PORT_HTTP` and `BREWBLOX_PORT_HTTPS` are set in the `brewblox/.env` file. 
Their default values are 80 and 443, but we can change that later.

```yaml
    labels:
      - traefik.http.routers.api.rule=PathPrefix(`/api`) || PathPrefix(`/dashboard`)
      - traefik.http.routers.api.service=api@internal
      - traefik.http.middlewares.prefix-strip.stripprefixregex.regex=/[^/]+
```

The two labels starting with `traefik.http.routers.api` are for the Traefik dashboard, hosted at `<ADDRESS>/dashboard/`.

`traefik.http.middlewares.prefix-strip.stripprefixregex.regex=/[^/]+`
is a reusable middleware for routing a public path with a prefix to a private path without a prefix.

```yaml
    volumes:
      - ./traefik:/config
      - /var/run/docker.sock:/var/run/docker.sock
```

The used SSL certs are placed in `./traefik`, along with a `traefik-cert.yaml` configuration file.

`/var/run/docker.sock:/var/run/docker.sock` allows access to the Docker socket.
This is required in order to autodetect active Docker containers.

```yaml
    command: >-
      --api.dashboard=true
      --providers.docker=true
      --providers.docker.constraints="Label(`com.docker.compose.project`, `${COMPOSE_PROJECT_NAME}`)"
      --providers.docker.defaultrule="PathPrefix(`/{{ index .Labels \"com.docker.compose.service\" }}`)"
      --providers.file.directory=/config
      --entrypoints.web.address=:${BREWBLOX_PORT_HTTP}
      --entrypoints.web.http.redirections.entrypoint.to=websecure
      --entrypoints.websecure.address=:${BREWBLOX_PORT_HTTPS}
      --entrypoints.websecure.http.tls=true
```

There are multiple things going on here.
- We want to automatically detect and use Brewblox containers, and only Brewblox containers. The easy way to do so is to check a label set by docker-compose: `com.docker.compose.project`
  - By default, this is the dir name, but we set it to always be `brewblox` by adding `COMPOSE_PROJECT_NAME=brewblox` to the .env file.
- The default routing rule for Brewblox (`--providers.docker.defaultrule`) is prefix-based.
  - eg. `<ADDRESS>/spark-one/blocks` should be routed to the `spark-one` service.
  - We can get service name from a container label set by docker-compose: `com.docker.compose.service`.
- We have two entrypoints: one for HTTP (`web`), and one for HTTPS (`websecure`).
  - The only job for the `web` entrypoint is to redirect queries to `websecure`.

## Traefik dashboard

You can check the Traefik dashboard by navigating to `<ADDRESS>/dashboard/`.
The last `/` is important.

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
      - traefik.http.services.eventbus.loadbalancer.server.port=15675

  influx:
    ...
    labels:
      - traefik.enable=false

  datastore:
    ...
    labels:
      - traefik.http.services.datastore.loadbalancer.server.port=5984
      - traefik.http.routers.datastore.middlewares=prefix-strip

  ui:
    ...
    labels:
      - traefik.http.routers.ui.rule=PathPrefix(`/ui`) || Path(`/`)
```

Notes:
- `eventbus` and `datastore` have multiple published ports, so we need to be specific.
- `influx` is not accessible through the gateway.
- `datastore` uses the `prefix-strip` middleware we declared in `traefik` labels.
- `ui` has a custom routing rule: if you go to `<Address>:<Port>`, you will be routed to the UI service.

So much for the default settings. Time for change!

## Adding DNS host names

Let's add another service: `webby`.
We want to be routed to `webby` if we navigate to `webby.local`.

First, we want the `webby.local` address to point to our host.
A permanent solution is to add an entry in the router DNS records,
but for now we can use `avahi-publish` to temporarily add DNS-SD records.

Open two terminal windows, and run (one command in each):

```
avahi-publish -a -R brewblox.local 192.168.XXX.XXX
```

```
avahi-publish -a -R webby.local 192.168.XXX.XXX
```

Replace `192.168.XXX.XXX` with the LAN address of your host.

Leave the terminal windows open. The records disappear when you close the running process.

Now, if we navigate to either `https://webby.local` or `https://brewblox.local`, we end up in the Brewblox UI.

## Host-based routing

Now, add the actual `webby` service to docker-compose.yml.
We'll keep it simple, and use the default Nginx image.

We want `webby.local` to go to `webby`, and `brewblox.local` to go to the Brewblox UI.

Let's override `ui` in `docker-compose.yml`, and add `webby`.

```yaml
  ui:
    labels:
      - traefik.http.routers.ui.rule=Host(`brewblox.local`) && (PathPrefix(`/ui`) || Path(`/`))

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
    command: >-
      ...
      --providers.docker.constraints="Label(`com.docker.compose.project`, `${COMPOSE_PROJECT_NAME}`)"
      ...
```

To add the `webby` project, you can modify the value to:
```
LabelRegex(`com.docker.compose.project`, `(${COMPOSE_PROJECT_NAME}|webby)`)
```

If you want all containers on the host to be managed by traefik, you can completely remove the `--providers.docker.constraints` argument.

Note that you can't partially override the `traefik` service `command`.
If you want to change one argument, you'll have to copy and include all other arguments.

Run `docker-compose config` afterwards to check the merged result.
