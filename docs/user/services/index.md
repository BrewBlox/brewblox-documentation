# Brewblox services

:::tip
This page explains how and why the service configuration works.

If you prefer to get started immediately with setting up a second Spark, you can skip forward to the [Brewblox Spark](./spark.md) page.
:::

Brewblox is designed to let you control multiple devices with a single application.

To make this both reliable and easy, devices are connected to a central hub (the **server**).

```plantuml
@startuml Server linked to devices

node Server
node SparkOne as "Spark controller #1" #cyan
node SparkTwo as "Spark controller #2" #cyan
node Tilt as "Tilt hydrometer" #cyan

Server <-right-> SparkOne
Server <-right-> SparkTwo
Server <-right-> Tilt

SparkOne -[hidden]- SparkTwo
SparkTwo -[hidden]- Tilt
@enduml
```

On the server, we need some software to talk to individual devices. To make it easy to add new devices, we split the software into **services**.

Some services are used for shared functionality: The **history service** collects data from device services, and stores it for later use in graphs. Others are used to control individual devices.

```plantuml
@startuml Services overview

node Server {
    component History as "service 'history'"
    component SvcSparkOne as "service 'spark-one'"
    component SvcSparkTwo as "service 'spark-two'"
    component SvcTilt as "service 'tilt'"
}

node DevSparkOne as "Spark controller #1" #cyan
node DevSparkTwo as "Spark controller #2" #cyan
node DevTilt as "Tilt hydrometer" #cyan

History -[hidden]- SvcSparkOne
SvcSparkOne -[hidden]- SvcSparkTwo
SvcSparkTwo -[hidden]- SvcTilt

SvcSparkOne -up-> History
SvcSparkTwo -up-> History
SvcTilt -up-> History

SvcSparkOne -right-> DevSparkOne
SvcSparkTwo -right-> DevSparkTwo
SvcTilt -right-> DevTilt

@enduml
```

## Service configuration

Services are configured using the `docker-compose.yml` file. [YAML](https://learnxinyminutes.com/docs/yaml/) is a markup language that uses indentation to show nested values.
You can follow [this guide](../config_editor.md) to install a graphical text editor for your configuration files.

A shortened configuration file:

```yaml
version: "3"

services:
  history:
    image: ghcr.io/brewblox/brewblox-history:edge

  spark-one:
    image: ghcr.io/brewblox/brewblox-devcon-spark:edge

  spark-two:
    image: ghcr.io/brewblox/brewblox-devcon-spark:edge

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

Each type of service may have a slightly different configuration. We'll take a detailed look at a Spark service here, but other services will have configuration that is very much like it.

## Docker-compose service syntax

When you install Brewblox, it generates a `docker-compose.yml` file for you. This includes the default `spark-one` service.

```yaml
  spark-one:
    image: ghcr.io/brewblox/brewblox-devcon-spark:${BREWBLOX_RELEASE}
    privileged: true
    restart: unless-stopped
    command: '--name=spark-one'
```

This configuration is more advanced than what we've seen so far. To make sense of it, we'll look at the individual settings.

---

```yaml
spark-one:
  image: ghcr.io/brewblox/brewblox-devcon-spark:${BREWBLOX_RELEASE}
  ...
```

This is like the short service configurations we saw earlier. The two most important settings in a service's configuration are its name (spark-one), and its type (everything after `image:`).

The basic principles still apply. When you want to control multiple Spark devices, you'll need one service per device. Every service will have the same `image`, but a different name.

---

```yaml
  ...
  privileged: true
  restart: unless-stopped
```

These settings are the same for every Spark service (and many other services).

`privileged` services can use USB connections.

`restart: unless-stopped` does what it says: when your service crashes, it will automatically restart.

---

```yaml
  ...
  command: '--name=spark-one'
```

The `command` setting contains arguments for the software running *inside* the service.

The `--name` argument must (again) be the same as the service name.

For a Spark service, the command is where you add the settings for [how it connects to a Spark controller](./spark.md#connection-settings)

::: tip
The service name is mentioned two times in the YAML for a Spark service. The values must match.

* at the top (`spark-one:`)
* in the command (`--name=spark-one`)

:::
