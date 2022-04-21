# Cross-compilation: Docker buildx

Date: 2020/03/18

## Context

Cross-compilation of Docker images already saw three previous attempts at implementation ([original](./20180314_docker_crosscompilation.md), [revisited](./20180522_crosscompilation_revisited.md), [base images](./20181207_crosscompilation_base_images.md)).

At that point, cross-compilation worked, and every build generated amd64 and arm32 images. The latter had tags prefixed with `rpi-`.

Multi-architecture images are made possible by using [manifests](https://docs.docker.com/edge/engine/reference/commandline/manifest/).

When evaluated, manifests were an early-stage experimental feature. The decision was to wait with implementation until the API became sufficiently stable.

## What's new

Docker [19.03](https://docs.docker.com/engine/release-notes/#19030) added the [buildx](https://docs.docker.com/buildx/working-with-buildx/) tool as experimental feature.

Buildx allows building the same image for multiple architectures.

## How to

Buildx comes included with Docker CE, but is hidden behind the experimental features flag.

To build an image under Docker CE:

``` sh
# Buildx is an experimental feature
export DOCKER_CLI_EXPERIMENTAL=enabled

# Enable the QEMU emulator, required for cross compiling
docker run --rm --privileged multiarch/qemu-user-static --reset -p yes

# Remove previous builders
docker buildx rm bricklayer || true

# Create and use a new builder
docker buildx create --use --name bricklayer

# Bootstrap the newly created builder
docker buildx inspect --bootstrap

# Build the image for amd and arm
# Give the image a tag
# Push the image to the docker registry
docker buildx build \
    --push \
    --platform linux/amd64,linux/arm/v7 \
    --tag "$REPO":"$TAG" \
    .
```

Azure Pipelines (and likely many other CI services) don't use Docker CE, but Docker EE, which does not come with a pre-installed version of buildx.
You can still download and install it.

To download and install buildx:

``` sh
curl \
    --output ~/.docker/cli-plugins/docker-buildx \
    --create-dirs \
    --location \
    https://github.com/docker/buildx/releases/download/v0.3.1/buildx-v0.3.1.linux-amd64
chmod a+x ~/.docker/cli-plugins/docker-buildx
```

After this, you can use the same build script. The experimental CLI flag is not required.

## Proposed changes to deployment pipelines

- Stop building emulation-ready base images for node and python
- Stop publishing PyPi packages for user-facing repositories
- Re-evaluate use of brewblox-dev when building
  - pro: one-click pipeline updates
  - con: black box for build commands. Custom behavior like the service_args flags is obscured.
- Tag multi-platform images as both "tag", and "rpi-tag" for a deprecation period. This allows for a more graceful transition to prefix-less images.

## Migrating user images

Adding multiple tags to the same image has negligible overhead.
We can keep on building both "tag", and "rpi-tag" images.
The only difference is that now they're just different names for the same image, and it will be perfectly ok to run rpi- prefixed images on an amd host.

## Migrating user configuration

The AMD and ARM versions of docker-compose.shared.yml can be merged: they are functionally the same already.
Every update overwrites this file. Migrating it is a straightforward operation.

To spread the impact, we can postpose rewriting tags in docker-compose.yml. Tagging the same image with and without rpi- prefix ensures backwards compatibility for both AMD and ARM setups.
