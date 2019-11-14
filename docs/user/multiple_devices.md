# Connecting multiple devices

BrewBlox is designed to let you control multiple devices with a single application.

To make this both reliable and easy, devices are connected to a central hub (the **server**).

<PlantUml src="server_devices.puml" title="Linked devices"/>

On the server, we need some software to talk to individual devices. To make it easy to add new devices, we split the software into **services**.

Some services are used for shared functionality: The **history service** collects data from device services, and stores it for later use in graphs. Others are used to control individual devices.

Some examples of supported devices:
- [Spark](./adding_services.html)
- [Tilt hydrometer](https://github.com/j616/brewblox-tilt)
- [iSpindel hydrometer ](https://github.com/bdelbosc/brewblox-ispindel)
- [Plaato digital airlock](https://github.com/BrewBlox/brewblox-plaato)

<PlantUml src="server_services.puml" title="Server services"/>

## Service configuration

Services are configured using the `docker-compose.yml` file. [YAML](https://learnxinyminutes.com/docs/yaml/) is a markup language that uses indentation to show nested values.

A shortened configuration file:

```yaml
version: "3"

services:
  history:
    image: brewblox/brewblox-history:edge

  spark-one:
    image: brewblox/brewblox-devcon-spark:edge

  spark-two:
    image: brewblox/brewblox-devcon-spark:edge

```

There are three services here:
* history
* spark-one
* spark-two

All of them have a unique name, but `spark-one` and `spark-two` share the same type. That's ok: as long as the name is unique, services can have the same settings.

GOOD:
```yaml
services:
  service-one:
    image: brewblox-image-one

  service-two:
    image: brewblox-image-one
```

BAD: 
```yaml
services:
  service-one:
    image: brewblox-image-one

  service-one:
    image: brewblox-image-two
```

## Adding devices

If we want to add a new device, we need a new service to manage it. Once again: the name must be unique, but the type can be the same.

Each type of service may have a slightly different install guide. You can find the one for adding new Spark services [here](./adding_services.html).

