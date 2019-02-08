# Single Spark

In contrast to the [simulation](./simulation), this configuration connects to a real BrewPi Spark.

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
    volumes:
        - ./brewblox/:/brewblox/
    command:
        - "--unit-system-file=config/celsius_system.txt"
        - "--database=/brewblox/spark_objects.json"
```

Just like the `spark` [service](./simulation.md#service-spark) in the simulation, this uses the celsius unit system.

Unlike the simulation, it does not use the `--simulation` command. 
Instead, it will attempt to identify a connected BrewPi Spark, and connect to that.

If the BrewPi Spark is connected using WiFi instead of USB, you can specify the device url with the `--device-url` command.

Example:
```yaml
spark:
    ...
    command:
        - "--device-url=192.168.0.100"
```

Using the `--database` command, an object database file was also mounted. 
The user-defined names of controller objects are saved here. By mounting the file, it will not be deleted when the service exits.

::: tip
If you're using multiple BrewPi Spark controllers, you can identify them by serial number.
See the [list spark devices](../advanced.md#listing-spark-devices) tutorial for more information.
:::
