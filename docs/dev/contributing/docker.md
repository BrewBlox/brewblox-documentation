# Getting started with BrewBlox: Docker

A quick overview of what buttons to press to get a new containerized service up and running.

## Starting out: boilerplate

If you're creating a new service, the boilerplate repository can help you out.

Create a new repository using the template at https://github.com/brewblox/brewblox-boilerplate (click the `Use this template` button in GitHub), and follow the instructions in https://github.com/BrewBlox/brewblox-boilerplate/blob/develop/README.md to get started.

At this point you'll have a working Python package that can be run locally, uploaded to PyPi, or installed in a Docker image. We'll ignore PyPi for now, and concentrate on Docker.

## The Dockerfile

In the boilerplate repository, `docker/amd/Dockerfile` describes a layered docker image: it has the latest version of Python 3, inherits `brewblox/brewblox-service` dependencies, and can install a local package.

You can leave the majority of settings as-is: for most services you only have to replace the references to `YOUR-PACKAGE` and `YOUR_PACKAGE`.

```Docker
FROM brewblox/brewblox-service:newest-tag as base

COPY ./dist /app/dist
COPY ./requirements.txt /app/requirements.txt

RUN pip3 install wheel \
    && ls /wheeley-base \
    && pip3 wheel --wheel-dir=/wheeley --find-links=/wheeley-base -r /app/requirements.txt \
    && pip3 wheel --wheel-dir=/wheeley --find-links=/wheeley --no-index /app/dist/*

FROM python:3.7-slim
EXPOSE 5000
WORKDIR /app

ARG service_info=UNKNOWN
ENV SERVICE_INFO=${service_info}

COPY --from=base /wheeley /wheeley
COPY ./config /app/config

RUN pip3 install --no-index --find-links=/wheeley YOUR-PACKAGE \
    && rm -rf /wheeley \
    && pip3 freeze

ENTRYPOINT ["python3", "-m", "YOUR_PACKAGE"]
```

To explain what it's doing:

```Docker
FROM brewblox/brewblox-service:newest-tag as base
```

Initially, we use the `brewblox/brewblox-service` image as base. This contains built wheel files for the shared aiohttp dependencies, and inherits the `python:3.7-full` image that includes a compiler.

```Docker
COPY ./dist /app/dist
COPY ./requirements.txt /app/requirements.txt

RUN pip3 install wheel \
    && ls /wheeley-base \
    && pip3 wheel --wheel-dir=/wheeley --find-links=/wheeley-base -r /app/requirements.txt \
    && pip3 wheel --wheel-dir=/wheeley --find-links=/wheeley --no-index /app/dist/*
```

This downloads all dependencies we specified in a `requirements.txt` file, and builds .whl (wheel) files for all these packages + whatever we put in `dist/`. If any dependencies contain C code, they are compiled now.

If a wheel file is already available (either on Pip, or from `/wheeley-base`) it is used.

Built wheel files are placed in `/wheeley`.

```Docker
FROM python:3.7-slim
```

We switch to the slim image, that is significantly smaller than the full `brewblox/brewblox-service` image.

This is done now, because the slim image can't compile C code. We don't need to anymore - we have the wheel files.

```Docker
EXPOSE 5000
```

This opens the 5000 port in the container. Aiohttp will listen for incoming connections on this port.

```Docker
WORKDIR /app
```

The working directory for building and running the application is now `/app`.
This is relevant if you're adding a volume to the container.

```Docker
ARG service_info=UNKNOWN
ENV SERVICE_INFO=${service_info}

COPY --from=base /wheeley /wheeley
COPY ./config /app/config

RUN pip3 install --no-index --find-links=/wheeley YOUR-PACKAGE \
    && rm -rf /wheeley \
    && pip3 freeze
```

We save the optional `service_info` build arg into an environment variable, and copy the built wheel files from the previous base image.

We can now install `YOUR-PACKAGE` and all its dependencies with the wheel files we have in the `/wheeley` directory in the `base` image layer. The `--no-index` flag makes sure that the build fails if somehow the earlier wheel build didn't generate wheels for all your dependencies.

```Docker
ENTRYPOINT ["python3", "-m", "YOUR_PACKAGE"]
```

When you run the image, it will immediately start your service application.

## Building the image

Full script first, then we'll walk through it:

```bash
python3 setup.py sdist
pipenv lock --requirements > docker/requirements.txt

rm docker/dist/*
cp dist/* docker/dist/

docker build \
  --tag your-package:local \
  --file docker/amd/Dockerfile \
  docker/
```

Now step by step: 

```bash
python3 setup.py sdist
```
This builds the Python package.

The output from building the package can be found in `dist/`, and is called `your-package-0.1.0.zip`. (0.1.0 being the version number).

```bash
pipenv lock --requirements > docker/requirements.txt
```

This is where we generate the `requirements.txt` used by `Dockerfile` to install the correct versions of our dependency packages.

```bash
rm docker/dist/*
cp dist/* docker/dist/
```
Remove all previous versions of your package from `docker/dist/`, so there's no confusion as to what version should be installed when building the Docker image.

Then copy the newly built image from `dist/` to `docker/dist/` so Docker can copy the files into the image.

```bash
docker build \
  --tag your-package:local \
  --file docker/amd/Dockerfile \
  docker/
```

Build the docker image, and call it `your-package`. Everything after the `:` is the version tag (in this case: `local`).
The build context is `docker/`. Docker can access everything in this directory (for example: to copy files into the image).

The `--file` argument instructs Docker where to find its build script. By default, it will use a `Dockerfile` directly inside the build context.

## Running the image

After building the image, there now is a `your-package:latest` image present on your computer.

You can run this by using `docker run -p 80:5000 your-package:latest`. The `-p 80:5000` argument forwards port 80 on your machine to port 5000 on the container - where your Python application is listening.

During configuration of the boilerplate code, you changed the default name of your service (in `__main__.py`).

If you haven't, you can now go to `http://localhost/YOUR_PACKAGE/api/doc` to see the endpoints registered in your service. If you did change the name, you'll have to replace `YOUR_PACKAGE` with the actual name.

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

For a detailed explanation of everything you can put in a compose file, see [the docker-compose documentation](https://docs.docker.com/compose/compose-file/#compose-file-structure-and-examples).

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

`traefik.frontend.rule=PathPrefix: /history` instructs Traefik to forward all requests to addresses starting with `/history` to this container. Example: `http://localhost/history/api/doc`.

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
docker-compose up -d
```

If you want to see the output of your package:
```
docker-compose logs --follow your_package
```

