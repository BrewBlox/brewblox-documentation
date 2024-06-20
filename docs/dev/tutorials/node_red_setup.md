# Node-RED: Setup

## Introduction

Node-RED is an low-code platform for writing automation tasks.
It can communicate with Brewblox APIs using MQTT and REST.

This tutorial show how to add a Node-RED service to an existing Brewblox system.
It assumes a basic familiarity with [YAML](https://learnxinyminutes.com/docs/yaml/)
and [Docker Compose](https://www.baeldung.com/ops/docker-compose).

## Create the local data directory

We want the flows created by Node-RED to be persistent.
To do this, we'll mount a `node-red` directory as volume.

In the Brewblox directory, run:

```sh
mkdir -p ./node-red
sudo chown -R 1000:1000 ./node-red
```

## Add the service

Edit your `docker-compose.yml` file, and add the following service:

```yaml
  node-red:
    image: nodered/node-red:latest-minimal
    restart: unless-stopped
    volumes:
    - type: bind
      source: ./node-red
      target: /data
    - type: bind
      source: /etc/localtime
      target: /etc/localtime
      read_only: true
```

## Fix service routing

Brewblox services share the same http and https ports.
To distinguish between them, the traefik proxy looks at the URL path prefix.
This prefix should match the service name.
Here, want the path to the editor UI to be prefixed with `/node-red`. \
To do this, we'll edit the automatically generated configuration.

First, start the service to generate the default configuration files:

```sh
brewblox-ctl up
```

Then, edit the configuration file to set the `/node-red` prefix for the web UI:

```sh
sudo sed -i 's#//httpAdminRoot:.*#httpAdminRoot: "/node-red",#g' ./node-red/settings.js
sudo chown 1000:1000 ./node-red/settings.js
```

Restart the service to apply the setting:

```sh
brewblox-ctl restart node-red
```

Now, when you visit `{BREWBLOX_ADDRESS}/node-red` in your browser, it will load the Node-RED web UI.
