# Docker Cross Compilation

Date: 2018/03/14

## Context

Most desktop computers, and our Travis automated build agents have the x86_64 CPU architecture.
Raspberry Pi has an ARMv7 architecture, and can't run Docker images built on x86_64.

Compilation of Brewblox service images is currently done manually on a Pi, and takes inordinately long (1 hour for history service).
We'd rather do this on the Travis build agent we're also using for creating the x86_64 container images.

## Requirements

* Automated building of ARMv7 architecture service images, integrated with the existing CI pipeline
* Quick building of images (<5 minutes)

## Existing

The following docker-compose snippet is valid for both x86 and ARM architectures:

```yaml
services:
  eventbus:
    image: rabbitmq:alpine
```

Inspection of the Docker hub registry shows that this is done using [manifests][2]. ([more info][4])

The [RabbitMQ][3] image `rabbitmq:alpine` does not directly exist. Instead, it is an image with multiple manifests: one for each architecture.

Pulling the `rabbitmq:alpine` image while on a Raspberry Pi will actually pull the `arm32v7/rabbitmq:alpine` [image][5].

Of note is that manifests are still considered an experimental feature - you need to explicitly [enable support][6].

If you're ok with using a different tag for a different architecture (`latest` vs `rpi-latest`) manifests are not required.

## Building

Hypriot (the team responsible for many Docker images for the Pi), published [a blog post][1] detailing the feasibility of building ARM containers in Travis.

When building the below Dockerfile, this did not work as hoped. While QEMU supports compilation, the host architecture is still x86_64. The image build was ok - but did not produce ARM binaries.

```docker
FROM python:3.6

EXPOSE 5000

RUN pip3 install -U brewblox-service

ENTRYPOINT ["python3", "-m", "brewblox_service"]
```

Explicitly pulling the arm image did not work either.

```docker
FROM arm32v7/python:3.6
...
```

```sh
Sending build context to Docker daemon  17.92kB
Step 1/6 : FROM arm32v7/python:3.6
3.6: Pulling from arm32v7/python
no matching manifest for linux/amd64 in the manifest list entries
```

The assumption is that for Hypriot's solution to work, we'd need a non-manifest ARM base image.

## Issues

Some googling revealed our issues to be an exact duplicate of an [open issue][7] - down to the scenario being attempted Python3 builds on a Travis agent. The issue is fresh (last post 8 feb 2018).

This revealed that there is no current override allowing docker to pull an image not matching the host architecture.

## Conclusion

Cross-architecture image building is probably on Docker's horizon, but is not currently supported.
There are some workarounds, but those do not play nice with Docker multi-arch manifests.

Our problem will be solved as soon as Docker supports the hypothetical `--arch=arm32v7` when pulling images.

Decisions:
* Build ARM Docker images on a Raspberry Pi until Docker supports cross-architecture pulling.
* Future task: run a build agent on a Raspberry, shadowing the Travis agent, but on ARM.


[1]: https://blog.hypriot.com/post/setup-simple-ci-pipeline-for-arm-images/
[2]: https://docs.docker.com/registry/spec/manifest-v2-2/#manifest-list
[3]: https://hub.docker.com/_/rabbitmq/
[4]: https://github.com/docker-library/official-images#architectures-other-than-amd64
[5]: https://hub.docker.com/r/arm32v7/rabbitmq/
[6]: https://docs.docker.com/engine/reference/commandline/cli/#configuration-files
[7]: https://github.com/docker/cli/issues/327


## References:

* https://blog.hypriot.com/post/setup-simple-ci-pipeline-for-arm-images/
* https://docs.docker.com/registry/spec/manifest-v2-2/#manifest-list
* https://hub.docker.com/_/rabbitmq/
* https://github.com/docker-library/official-images#architectures-other-than-amd64
* https://hub.docker.com/r/arm32v7/rabbitmq/
* https://docs.docker.com/engine/reference/commandline/cli/#configuration-files
* https://github.com/docker/cli/issues/327