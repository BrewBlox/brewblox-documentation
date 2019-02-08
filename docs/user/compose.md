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

## Service Keys

To use a real example of a service:

```yaml
spark:
    image: brewblox/brewblox-devcon-spark:rpi-latest
    privileged: true
    depends_on:
        - eventbus
    labels:
        - "traefik.port=5000"
        - "traefik.frontend.rule=PathPrefix: /spark"
    volumes:
        - ./brewblox/:/brewblox/
    command:
        - "--unit-system-file=config/celsius_system.txt"
        - "--database=/brewblox/spark_objects.json"
```

* `image` defines the Docker image name. This is the template for the application.
* `privileged` services can use host devices (for example: USB devices).
* `depends_on` lists the other services that are a dependency for this service. In this case, the `eventbus` service is used to send and receive messages from other services.
* `labels` sets string properties. These specific `traefik.XXX` labels are used by the `traefik` service to redirect HTTP requests.
* `volumes` are files on the host (the Raspberry Pi) that this service can use. The syntax is `/host/file/name`:`/service/file/name`.
* `command` are command line arguments that are passed to the application running in the service.
