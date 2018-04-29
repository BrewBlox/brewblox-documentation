# Getting started with BrewBlox: Docker

A quick overview of what buttons to press to get a new containerized service up and running.

## Starting out: boilerplate

If you're creating a new service, the boilerplate repository can help you out.

Create a new fork of https://github.com/brewblox/brewblox-boilerplate, and follow the instructions in https://github.com/BrewBlox/brewblox-boilerplate/blob/develop/README.md to get started.

At this point you'll have a working Python package that can be run locally, uploaded to PyPi, or installed in a Docker image. We'll ignore PyPi for now, and concentrate on Docker.

## The Dockerfile

In the boilerplate repository, the `docker/Dockerfile` describes a straightforward Docker image: it has Python3.6, inherits `brewblox/brewblox-service` dependencies, and can install a local package.

To explain what it's doing:

```Docker
RUN mkdir -p /pkg
COPY ./pkg/* /pkg/
```

This copies everything from the `docker/pkg/` directory (outside the image) into the `/pkg/` dictory inside the image.

This allows building Docker images from local Python packages (not available on PyPi).

```Docker
RUN pip3 install /pkg/* || true \
    && pip3 install YOUR-PACKAGE \
    && pip3 show YOUR-PACKAGE
```

By now you'll have replaced `YOUR-PACKAGE` with something meaningful, but the logic remains the same:
* It tries to install everything from `/pkg/` (those local packages copied in earlier)
* It installs the package, and its dependencies. If a local version of the package was installed already, it won't attempt to find a new version on PyPi. This is useful for both local-only packages, and dev versions.

```Docker
ENTRYPOINT ["python3", "-m", "YOUR_PACKAGE"]
```

When you run the image, it will immediately start your service application.

## Building the image

Full script first, then we'll walk through it:

```bash
tox

rm docker/pkg/*
cp .tox/dist/* docker/pkg/

docker build --tag your-package:local docker/
```

Now step by step: 

```bash
tox
```
This builds the Python package, and runs all tests PyTest could find.

The output from building the package can be found in `.tox/dist/`, and is called `your-package-0.1.0.zip`. (0.1.0 being the version number).

```bash
rm docker/pkg/*
cp .tox/dist/* docker/pkg/
```
Remove all previous versions of your package from `docker/pkg/`, so there's no confusion as to what version should be installed when building the Docker image.

Then copy the newly built image from `.tox/dist/` to `docker/pkg/` so Docker can copy the files into the image.

```bash
docker build --tag your-package:local docker/
```

Build the docker image, and call it `your-package`. Everything after the `:` is the version tag (in this case: `local`).

## Running the image

After building the image, there now is a `your-package:latest` image present on your computer.

You can run this by using `docker run -p 80:5000 your-package:latest`. The `-p 80:5000` argument forwards port 80 on your machine to port 5000 on the container - where your Python application is listening.

During configuration of the boilerplate code, you changed the default name of your service ([here](https://github.com/BrewBlox/brewblox-boilerplate/blob/5babb2c6ec4fb03bf833964854a2c680ffa0a133/YOUR_PACKAGE/__main__.py#L122)).

If you haven't, you can now go to http://localhost/YOUR_PACKAGE/api/doc to see the endpoints registered in your service. If you did change the name, you'll have to replace `YOUR_PACKAGE` with the actual name.

## Interacting with other BrewBlox services

Just after getting started, no other BrewBlox services are needed.
* We're not directly communicating with the history service, InfluxDB, or other device services.
* We already did the gateway's job by manually forwarding host port 80 to container port 5000
* The eventbus is designed to be safe: it will not crash your service when it can't connect.

This can change of course. Those other services do useful things. 

This is where Docker-compose comes in.

Create a new file in the repository called `docker-compose.yml`, and put the following code in there.

Again, code first, walkthrough after:

```yaml
version: '3'

services:
  eventbus:
    image: rabbitmq:alpine

  influx:
    image: influxdb:alpine

  traefik:
    image: traefik
    command: -c /dev/null --api --docker --docker.domain=docker.localhost --logLevel=DEBUG
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock

  history:
    image: brewblox/brewblox-history:latest
    depends_on:
      - influx
      - eventbus
    labels:
      - "traefik.port=5000"
      - "traefik.frontend.rule=PathPrefix: /history"

  your_package:
    image: your-package:local
    depends_on:
      - eventbus
    labels:
      - "traefik.port=5000"
      - "traefik.frontend.rule=PathPrefix: /your_package"
```

For a detailed explanation of everything you can put in a compose file, see https://docs.docker.com/compose/compose-file/#compose-file-structure-and-examples.

We'll just concentrate on the bits most relevant for this service.

```yaml
  eventbus:
    image: rabbitmq:alpine

  influx:
    image: influxdb:alpine

  traefik:
    image: traefik
    command: -c /dev/null --api --docker --docker.domain=docker.localhost --logLevel=DEBUG
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
```

This bit declares the three external services we're using: RabbitMQ, InfluxDB, and Traefik. You can just copy-paste this, and it'll be fine.

```yaml
  history:
    image: brewblox/brewblox-history:latest
    depends_on:
      - influx
      - eventbus
    labels:
      - "traefik.port=5000"
      - "traefik.frontend.rule=PathPrefix: /history"
```

This is the BrewBlox history service. It needs both Influx and RabbitMQ to do its job, and needs to be recognized by the Traefik gateway.

```yaml
    labels:
      - "traefik.port=5000"
      - "traefik.frontend.rule=PathPrefix: /history"
```

Traefik automatically recognizes active Docker containers, but needs a hint on how it should treat them.

`traefik.port=5000` tells Traefik to forward traffic to port 5000 on this container.

`traefik.frontend.rule=PathPrefix: /history` instructs Traefik to forward all requests to addresses starting with `/history` to this container. Example: http://localhost/history/api/doc.

```yaml
  your_package:
    image: your-package:local
    depends_on:
      - eventbus
    labels:
      - "traefik.port=5000"
      - "traefik.frontend.rule=PathPrefix: /your_package"
```

The same thing again for your package: it can talk to the event bus, and would like all requests starting with `/your_package` forwarded to the correct port.

You can start it all by using
```bash
docker-compose up
```

or, if you only want to see the output of your package:
```bash
docker-compose up -d && docker-compose up your_package
```
