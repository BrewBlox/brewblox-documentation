# Advanced Tutorials

For people comfortable using command-line applications, there are some alternatives for configuring and using the BrewBlox system.

These tutorials are an extension of the default [Getting Started guide](./startup.md).

## Managing BrewBlox using the terminal

BrewBlox is a set of [Docker](https://docs.docker.com/) containers, managed by [docker-compose](https://docs.docker.com/compose/). </br>

To get started with docker-compose, you can find a tutorial [here](https://docs.docker.com/compose/gettingstarted/#step-3-define-services-in-a-compose-file).

::: warning
The Raspberry Pi uses the `ARM32v7` processor architecture. This is supported by most [official Docker images](https://hub.docker.com/explore/), but not all.

All BrewBlox images built for the Pi have their version prefixed with `rpi-`. (Example: `brewblox/brewblox-history:rpi-latest`).
:::

## Installing BrewBlox on a desktop computer

BrewBlox can be installed on any system that has Docker installed.

Installing Docker is easy on [Ubuntu Linux](https://docs.docker.com/install/linux/docker-ce/ubuntu/), but more complicated for [Windows](https://docs.docker.com/docker-for-windows/install/). The [Mac](https://docs.docker.com/docker-for-mac/install/#install-and-run-docker-for-mac) version can't natively [access USB devices](https://github.com/docker/for-mac/issues/900).

Docker-compose files must be adjusted between desktop and Pi versions, to account for the different architecture. Usually this means changing the version tag, but occasionally the Pi uses third-party images of external applications (eg. InfluxDB, Compose UI).

The BrewBlox install script will automatically select the correct image versions for your system.


## Listing Spark devices

By default, a `spark` service will list all USB devices, and connect to the first BrewPi Spark it sees.
This works perfectly fine for a single Spark, but will be unreliable when using multiple Spark devices.

For this reason, the `brewblox/brewblox-devcon-spark` image has a `--list-devices` command.
This will print out all connected devices, and exit.

To use:
* Plug the BrewPi Spark in the Raspberry Pi USB port
* Open the terminal on the Raspberry Pi
* Run the following command:
```
docker run --privileged brewblox/brewblox-devcon-spark:rpi-develop --list-devices
```

Example output:
```
2018/07/11 13:43:23 INFO     brewblox_service.service        Creating [spark] application
2018/07/11 13:43:23 INFO     __main__                        Listing connected devices:
2018/07/11 13:43:23 INFO     __main__                        >> /dev/ttyACM1 | P1 - P1 Serial | USB VID:PID=2B04:C008 SER=240024000451353432383931 LOCATION=1-1.5:1.0
2018/07/11 13:43:23 INFO     __main__                        >> /dev/ttyACM0 | P1 - P1 Serial | USB VID:PID=2B04:C008 SER=3f0025000851353532343835 LOCATION=1-1.3:1.0
2018/07/11 13:43:23 INFO     __main__                        >> /dev/ttyAMA0 | ttyAMA0 | 3f201000.serial
```

There are three connected devices, two of which are P1 Sparks. The important information is their unique serial number (`SER=240024000451353432383931` and `SER=3f0025000851353532343835`).

We can now use the serial number to connect by ID. This will match a service to a specific Spark.

Example service:
```yaml
spark:
    # standard configuration
    image: brewblox/brewblox-devcon-spark:rpi-latest
    privileged: true
    depends_on:
        - eventbus
        - datastore
    labels:
        - "traefik.port=5000"
        - "traefik.frontend.rule=PathPrefix: /spark"

    # connect by id
    command:
        - "--device-id=240024000451353432383931"
        # or "--device-id=3f0025000851353532343835"
```
