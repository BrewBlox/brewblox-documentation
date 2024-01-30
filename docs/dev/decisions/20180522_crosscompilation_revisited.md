# Cross-compilation: Revisited

Date: 2018/05/22

## Context

[Previous research](./20180314_docker_crosscompilation.md) concluded that cross compiling ARMv7 Docker images was not feasible.

Re-evaluating used references indicated that a solution was not yet considered.

## Revisiting

As a point of reference, the last attempt made during the cross compilation research was to enable the QEMU compiler, and then use an ARMv7 image.

Enabling QEMU:

```bash
docker run --rm --privileged multiarch/qemu-user-static:register --reset
```

Docker image inheritance declaration:

```docker
FROM arm32v7/python:3.6
...
```

This resulted in the following error:

```bash
Sending build context to Docker daemon  17.92kB
Step 1/6 : FROM arm32v7/python:3.6
3.6: Pulling from arm32v7/python
no matching manifest for linux/amd64 in the manifest list entries
```

At this point a Docker issue was dug up that indicated that pulling ARMv7 images on an AMD64 architecture is not yet supported.

## Alternative approach

After some consideration, the hypothesis was made that one approach was not yet considered: using a Docker base image explicitly intended for cross compilation.

Enabling QEMU remained the same:

```bash
docker run --rm --privileged multiarch/qemu-user-static:register --reset
```

The base image declaration was changed to:

```docker
FROM resin/raspberry-pi-python:3.6
...
```

This worked. The generated image can't be run on an AMD64 machine, but works perfectly on a Raspberry Pi.

It does require that each service maintains two similar Docker files: one for AMD/desktop, and one for ARM/Raspberry.

## Build time

The excessive build time for the ARM history image remained an issue (>1 hour). This was caused by having to recompile a large C/C++ dependency of a dependency - one we didn't use.

[An issue][aioinflux issue] was submitted to the relevant project, and resolved in short order by the author. This reduced the history service build time from more than an hour to less than a minute.

[aioinflux issue]: https://github.com/plugaai/aioinflux/issues/9
