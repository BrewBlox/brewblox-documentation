# Generating clean Python docker images

Date: 2018/11/12

## Problem

Python packages can include both Python and C source code. While Python code is interpreted on the spot, C code must be compiled during installation.

This also means that C code must be compiled for the correct platform. Compiling code when building Docker images is described in other design documents. ([cross compilation][xcompile-1], [cross compilation (2)][xcompile-2]). <br>

Compiling code during image creation requires compilers to be installed in the image. Compilers are not used during image runtime, but still significantly increase its size (`python:3.6` is 600mb larger than `python:3.6-slim`).

## Alternatives

The requirements can be summarized as follows:

- We need Python-dev compilers (for short: the `python:3.6` Docker image) during image creation
- We only want the runtime environment during image runtime (for short: `python:3.6-slim` or `python:3.6-alpine`)

There are multiple possible approaches:

- Start with `python:3.6`, and remove superfluous packages and software after installation
- Start with `python:3.6-slim`, and add compilation packages during installation, before removing them again.
- Use different image parents (the Docker `FROM`) for installation and runtime.

The first two options would require micro-managing installed packages. The basic assumption is that the Docker team responsible for creating Python images is better aware of the optimum configuration for both `python:3.6` and `python:3.6-slim`.

The last option ([multi-stage builds][multistage-docker]) is attractive in how we'd only need to manage our own code, not system package.

## Implementation

Multi stage builds rely on copying files between stages. For our images this means we'd build Python packages in the `python:3.6` image, before switching to `python:3.6-slim` and only copying the distributable packages.

Pip can [build wheel files][pip-wheel] where C source code is included as a binary file. Binary wheel files are installable without a compiler.

The required steps now are:
- Import `python:3.6` image
- Build wheel files for all dependencies
- Import `python:3.6-slim` image
- Copy wheel files from `python:3.6` image.
- Install wheel files in `python:3.6-slim`.
- Remove wheel files to clean up.
- Push the slim image with installed wheels, discarding the `python:3.6` image.

Example:
```docker
FROM python:3.6 as base

COPY ./dist /build/dist

RUN pip3 install wheel \
    && pip3 wheel /build/dist/* --wheel-dir=/wheeley

# Image switch
FROM python:3.6-slim

COPY --from=base /wheeley /wheeley

RUN pip3 install --no-index --find-links=/wheeley brewblox-devcon-spark \
    && rm -rf /wheeley

ENTRYPOINT ["python3", "-m", "brewblox_devcon_spark"]
```

This configuration assumes that a local Python distributable package is available in `./dist` on the host.

We copy the local package, and build wheels for it plus all its dependencies. Built wheels are deposited in `/wheeley`. We now have distributable files that can be installed without a compiler.

Now we switch to the compiler-less `python:3.6-slim`, copy the `/wheeley` directory, and install everything in it.
Note that we're using the `--no-index` flag. This prevents Pip from downloading uncompiled packages.

By switching base image, the layers from `python:3.6` are automatically discarded when pushing the image.

## Partial compilation (brewblox-service)

Brewblox services inherit from `brewblox-service`, where some of the largest dependencies (aiohttp) were introduced.

If specific images (`brewblox-devcon-spark`, `brewblox-history`) can inherit built wheel files from `brewblox-service`, then this would significantly improve build time.

Example (brewblox-service):

```docker
FROM python:3.6

COPY ./dist /build/dist

RUN pip3 install wheel \
    && pip3 wheel /build/dist/* --wheel-dir=/wheeley \
    && pip3 install --no-index --find-links=/wheeley brewblox-service

ENTRYPOINT ["python3", "-m", "brewblox_service"]
```

Example (brewblox-devcon-spark):
```docker
FROM brewblox/brewblox-service:latest as base

COPY ./dist /build/dist

RUN pip3 install wheel \
    && pip3 wheel /build/dist/* --wheel-dir=/wheeley --find-links=/wheeley

# Image switch
FROM python:3.6-slim

COPY --from=base /wheeley /wheeley

RUN pip3 install --no-index --find-links=/wheeley brewblox-devcon-spark \
    && rm -rf /wheeley

ENTRYPOINT ["python3", "-m", "brewblox_devcon_spark"]
```

In the `brewblox-service` image we do not swap to `python:3.6-slim` after compilation. This allows `brewblox-devcon-spark` to import the `brewblox-service` as compiler image. <br>
`brewblox-devcon-spark` now also has access to the `/wheeley` directory in `brewblox-service`, and can skip compiling all the dependencies it inherited from `brewblox-service`.


## Conclusion

By using multi-stage builds we profit from the best of two worlds.
- We purely use pre-configured images: we do not need to manually install python-dev apt packages.
- Our runtime images are kept small, and do not include packages that were only needed during installation.

Crosscompiling software for the Raspberry Pi ARM32v7 environment takes considerably more time than building AMD images. This is optimized by re-using wheel files built by `brewblox-service`.



[xcompile-1]: ./docker_crosscompilation.html
[xcompile-2]: ./crosscompilation_revisited.html
[multistage-docker]: https://docs.docker.com/develop/develop-images/multistage-build/
[pip-wheel]: https://pip.pypa.io/en/stable/reference/pip_wheel/
