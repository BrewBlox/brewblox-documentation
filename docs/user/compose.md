# Configuration syntax

BrewBlox projects use [docker-compose](https://docs.docker.com/compose/) for configuration.

`docker-compose.yml` files are written in [YAML](https://en.wikipedia.org/wiki/YAML).
This guide gives a short description of the most common configuration properties.
For a full description, see the [docker-compose documentation](https://docs.docker.com/compose/compose-file/).

## File Structure

The basic structure of a `docker-compose.yml` file is:
```yaml
version: '3'

services:
  service-one:
    image: name:version

# This is a comment

  service-two:
    image: name:version
```

To walk through the parts:

```yaml
version: '3'
```
The docker-compose syntax version. In almost all cases you can use the latest and greatest.

```yaml
services:
  service-one:
    ...

  service-two:
    ...
```
All services in the project are listed under the `services` key. In this example we have two services: `service-one` and `service-two`.

```yaml
# This is a comment
```

Comments in YAML start with a `#`.

## Common issues

**Mixing tabs and spaces**

YAML supports either tab characters as indentation, or spaces, but not both at the same time.
The default indentation for BrewBlox configuration is to use 2 spaces per level of indentation.

If you get errors loading your docker-compose.yml file, you can check your indentation by displaying control characters in your editor.

**Indenting comments**

It is not required in all cases, but a good rule of thumb is to always place the comment character `#` on the first position in the line. This avoids confusion when in combination with multi-line YAML strings.

Good:
```yaml
services:
  service-one:
    ...
    command: >
      multi-line
      string
# Comment
```

Bad:
```yaml
services:
  service-one:
    ...
    command: >
      multi-line
      string
      # Looks like a comment, but actually part of the string
```

## Service Keys

To use some real examples:

```yaml
services:

  spark-one:
    image: brewblox/brewblox-devcon-spark:rpi-${BREWBLOX_RELEASE:-stable}
    privileged: true
    depends_on:
      - eventbus
      - datastore
    restart: unless-stopped
    labels:
      - "traefik.port=5000"
      - "traefik.frontend.rule=PathPrefix: /spark-one"
    command: >
      --name=spark-one
      --mdns-port=5000

  traefik:
    image: traefik
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./traefik:/config
      - /var/run/docker.sock:/var/run/docker.sock
    command: >
      -c /dev/null
      --docker 
      --docker.domain=brewblox.local
      --entrypoints='name:http Address::80 Redirect.EntryPoint:https'
      --entrypoints='name:https Address::443 TLS:config/brewblox.crt,config/brewblox.key'
      --defaultentrypoints="http,https"
```

* `image` defines the Docker image name. This is the template for the application.
* `privileged` services can use host devices (for example: USB devices).
* `depends_on` lists the other services that are a dependency for this service. In this case, the `eventbus` service is used to send and receive messages from other services, and `datastore` stores persistent settings.
* `labels` sets string properties. These specific `traefik.XXX` labels are used by the `traefik` service to redirect HTTP requests.
* `ports` define how the container is accessible from outside. The syntax is `host port:container port`.
* `volumes` are files on the host (the Raspberry Pi) that this service can use. The syntax is `/host/file/name`:`/service/file/name`.
* `command` are command line arguments that are passed to the application running in the service. The `command: >` syntax indicates a multi-line string starts here.
