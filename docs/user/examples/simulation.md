# Simulation

This configuration starts a BrewPi Spark service in simulation mode, and does not require an actual Spark to be connected.

```yaml
version: '3'

services:
    spark:
        image: brewblox/brewblox-devcon-spark:rpi-latest
        privileged: true
        depends_on:
            - eventbus
        labels:
            - "traefik.port=5000"
            - "traefik.frontend.rule=PathPrefix: /spark"
        command:
            - "--simulation"
            - "--unit-system-file=config/celsius_system.txt"

    #
    # System services start here
    #

    eventbus:
        image: rabbitmq:latest
        volumes:
            - "./influxdb:/var/lib/influxdb"

    influx:
        image: hypriot/rpi-influxdb:latest

    history:
        image: brewblox/brewblox-history:rpi-latest
        depends_on:
            - influx
            - eventbus
        labels:
            - "traefik.port=5000"
            - "traefik.frontend.rule=PathPrefix: /history"

    traefik:
        image: traefik
        command: -c /dev/null --api --docker --docker.domain=docker.localhost
        ports:
            - "80:80"
            - "8080:8080"
        volumes:
            - /var/run/docker.sock:/var/run/docker.sock
```

## System services

For a detailed description of the generic system services, see [System Services](./system)

## Service: spark

```yaml
spark:
    image: brewblox/brewblox-devcon-spark:rpi-latest
    privileged: true
    depends_on:
        - eventbus
    labels:
        - "traefik.port=5000"
        - "traefik.frontend.rule=PathPrefix: /spark"
    command:
        - "--simulation"
        - "--unit-system-file=config/celsius_system.txt"
```

Just like `history`, `spark` has a label to receive HTTP requests. Try it out: `http://raspberrypi/spark/api/doc`.

Currently, two command line arguments are used:
* `--simulation` tells it not to connect to a real spark, but simulate one instead.
* `--unit-system-file` can be used to set the units of measurement you want to see in the GUI. Two files are provided by default:
    * `config/celsius_system.txt`
    * `config/fahrenheit_system.txt`

::: tip
You can configure the units displayed by the system.
See the [defining base units](../advanced.md#defining-base-units) tutorial for more information.
:::
