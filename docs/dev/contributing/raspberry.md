# Getting started with Brewblox: Raspberry containers

An overview of what changes must be made to build and run Docker containers on the Raspberry Pi.

## Assumptions

This guide assumes that you've followed the **Getting started with Brewblox: Docker** guide previously, and have a `your-package:local` Docker image on your computer.

## What's different?

The overwhelming majority of modern desktop computers use the AMD64 (also referred to as x86_64) processor architecture. Smaller devices, such as the Raspberry Pi, use a different architecture: ARM.

Binary executable files compiled for one architecture can't be used by processors of the other type. This includes Docker images.

Attempting to run an AMD64 Docker image on a Raspberry will immediately error out.

## Inheriting ARM images

For third-party images, the solution is often simple: somebody else already provides an image for the desired architecture.

Where for desktop builds we'd use the following images in our `docker-compose.yml`:

```yaml
services:
  eventbus:
    image: rabbitmq:alpine

  influx:
    image: influxdb:alpine

  traefik:
    image: traefik
```

For the Pi, we switch to:

```yaml
services:
  eventbus:
    image: rabbitmq:alpine

  influx:
    image: hypriot/rpi-influxdb

  traefik:
    image: traefik
```

Surprisingly, `eventbus` and `traefik` continue to use the same versions. This is done using Docker manifests (https://docs.docker.com/edge/engine/reference/commandline/manifest/) where Docker uses the current architecture to automatically select the image that's really used.

At time of writing multi-architecture manifests are still an experimental feature. Brewblox doesn't use them. Instead, users should manually select the correct version.

All ARM versions of Brewblox are prefixed with `rpi-`. If you want the latest version of the history service on your desktop, you pull `brewblox/brewblox-history:latest`. If you want it on a Pi, you pull `brewblox/brewblox-history:rpi-latest`.

## Building ARM images

The solution for building ARM images seems simple: just do it on ARM hardware. Install Python 3 and Docker on a Pi, and run the build script.

This works as long as you're willing to always do this manually, and accept long build times (a Pi is not that fast).

The good news: cross-compiling is possible. We can build ARM images on AMD64 computers.

To enable cross-compiling images in your current terminal session, run 

```bash
docker run --rm --privileged multiarch/qemu-user-static:register --reset
```

In the [Docker guide](./docker.md) guide we used `docker/amd/Dockerfile`. Now we'll switch to `docker/arm/Dockerfile`

Build script:
```bash
# changed (new command)
docker run --rm --privileged multiarch/qemu-user-static:register --reset

python3 setup.py sdist
pipenv lock --requirements > docker/requirements.txt

rm docker/dist/*
cp dist/* docker/dist/

docker build \
  --tag your-package:rpi-local \ # changed (local -> rpi-local)
  --file docker/arm/Dockerfile \ # changed (docker/amd -> docker/arm)
  docker/
```

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
