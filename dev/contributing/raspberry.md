# Getting started with BrewBlox: Raspberry containers

An overview of what changes must be made to build and run Docker containers on the Raspberry Pi.

## Assumptions

This guide assumes that you've followed the **Getting started with BrewBlox: Docker** guide previously, and have a `your-package:local` Docker image on your computer.

## What's different?

The overwhelming majority of modern desktop computers use the AMD64 (also referred to as x86_64) processor architecture. Smaller devices, such as the Raspberry Pi, use a different architecture: ARM.

Binary executable files compiled for one architecture can't be used by processors of the other type. This includes Docker images.

Attempting to run an AMD64 Docker image on a Raspberry will immediately error out.

## Inheriting ARM images

For third-party images, the solution is often simple: somebody else already provides an image for the desired architecture.

Where for desktop builds we'd use the following images in our `docker-compose.yml`:

```yml
services:
  eventbus:
    image: rabbitmq:alpine

  influx:
    image: influxdb:alpine

  traefik:
    image: traefik
```

For the Pi, we switch to:

```yml
services:
  eventbus:
    image: rabbitmq:alpine

  influx:
    image: hypriot/rpi-influxdb

  traefik:
    image: traefik
```

Surprisingly, `eventbus` and `traefik` continue to use the same versions. This is done using Docker manifests (https://docs.docker.com/edge/engine/reference/commandline/manifest/) where Docker uses the current architecture to automatically select the image that's really used.

At time of writing multi-architecture manifests are still an experimental feature. BrewBlox doesn't use them. Instead, users should manually select the correct version.

All ARM versions of BrewBlox are prefixed with `rpi-`. If you want the latest version of the history service on your desktop, you pull `brewblox/brewblox-history:latest`. If you want it on a Pi, you pull `brewblox/brewblox-history:rpi-latest`.

## Adjusting the Dockerfile

In the first line of the BrewBlox boilerplate Dockerfile, it inherits from brewblox-service.

```Docker
FROM brewblox/brewblox-service:latest
```

Switching to ARM is as simple as changing this line to

```Docker
FROM brewblox/brewblox-service:rpi-latest
```

The problem is that now `docker build` will fail as it attempts to interact with ARM binaries.

## Building ARM images

The solution for building ARM images seems simple: just do it on ARM hardware. Install Python3.6 and Docker on a Pi, and run the build script.

This works as long as you're willing to always do this manually, and accept long build times (a Pi is not that fast).

The good news: cross compiling is possible. We can build ARM images on AMD64 computers.

To enable cross compiling images in your current terminal session, run 

```bash
docker run --rm --privileged multiarch/qemu-user-static:register --reset
```

In the "Getting started with Docker" guide we used `docker/amd/Dockerfile`. Now we'll switch to `docker/arm/Dockerfile`

Dockerfile:
```Docker
FROM brewblox/brewblox-service:rpi-latest

EXPOSE 5000
WORKDIR /app

COPY ./dist /app/dist
RUN pip3 install /app/dist/*
RUN pip3 show YOUR-PACKAGE

ENTRYPOINT ["python3", "-m", "YOUR_PACKAGE"]
```

Build script:
```bash
tox

rm docker/dist/*
cp .tox/dist/* docker/dist/

docker run --rm --privileged multiarch/qemu-user-static:register --reset
docker build \
  --tag your-package:rpi-local \
  --file docker/arm/Dockerfile \
  docker/
```

Note how we changed the `latest` and `local` versions to `rpi-latest` and `rpi-local`.

## Manually deploying an image

If you want to immediately use Docker Hub, you can ignore this step.

To save a Docker image for export:
```bash
docker save -o ./your-package-file your-package:rpi-local
```

Copy `your-package-file` to your Pi using `scp` or a usb stick, and then run:
```bash
docker load -i ./your-package-file
```

You can now run `your-package:rpi-local` on the Pi, or use it in a `docker-compose.yml`
