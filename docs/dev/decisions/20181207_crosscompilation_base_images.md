# Cross-compilation: base images

Date: 2018/12/07

## Context

Cross-compilation of Docker images already saw two previous attempts at implementation ([original][xcompile-1], [revisited][xcompile-2]).

At that point, the conclusion was that it was feasible, but couldn't use images that specify their target platform in their [manifest][manifest].


## Recap

In order to build ARM images on an AMD host, you need:
- An ARM base image suitable for cross-compilation
- A cross-compiler enabled during build

Some of the more popular images in the Docker Hub standard library (including Python) have ARM versions. <br>
The problem is, however, that they automatically select the correct version based on your computer's platform and architecture. 

When pulling `python:latest` on a Linux desktop, it will pull the image suitable for `linux/amd64` from [here][python-amd]. When pulling on a Raspberry Pi, it will select the `linux/arm32v7` image from [here][python-arm].

When explicitly pulling `arm32v7/python:latest` on an AMD64 machine, Docker checks its manifest, and throws an error: the platforms don't match.

## What's new

[This][build-guide] guide describes the process of building cross-compiled images, but offers some additional information: the secret sauce required to make an image viable for cross-compilation.

One just has to download the static QEMU compiler, and add it to the image. It's that simple.

The second issue (mismatched platforms) can be solved using Docker. `docker pull` and `docker build` have an experimental [--platform][docker-cli] switch that can override the manifest check. For this case, we want to use `--platform linux/arm`.

## Implementation

Enabling experimental flags requires editing the docker user config file (default: `~/.docker/config.json`). We don't really want to have to do this for each and every Travis build, but we need to edit the base image anyway.

Solution: build Python base images that are nothing more than the standard library image + the static QEMU compiler. By pushing our own version we also get rid of the explicit manifest check, as we don't specify target platform in the pushed image.

### `build_images.sh`

```bash
#! /bin/bash

# Download the static QEMU compiler, and copy it to this directory
sudo apt update
sudo apt install -y qemu qemu-user-static qemu-user binfmt-support
cp $(which qemu-arm-static) .

# Set the "experimental": "enabled" flag in the docker config file
# This is required for using the --platform flag
python3 ./enable_experimental.py

# We want the full images (3.6, 3.7) to compile, and the slim images (3.6-slim, 3.7-slim) for runtime
TAGS="3.6 3.6-slim 3.7 3.7-slim"

# The required Dockerfile is pretty simple: we pull the base image, and add QEMU
# No need to have four separate files where only the tag is different
for tag in ${TAGS}; do
    echo "
    FROM arm32v7/python:${tag}
    COPY ./qemu-arm-static /usr/bin/qemu-arm-static
    " > ./Dockerfile

    # Build the image, and push it to our own repository: brewblox/rpi-python
    docker build --platform=linux/arm --no-cache -t brewblox/rpi-python:${tag} .
    docker push brewblox/rpi-python:${tag}
done
```

### `enable_experimental.py`

```python
import json
from os.path import expanduser


def main():
    fname = f'{expanduser("~")}/.docker/config.json'
    try:
        with open(fname, 'r') as f:
            content = f.read()
            config = json.loads(content or '{}')
    except FileNotFoundError:
        config = {}

    if 'experimental' in config.keys():
        return

    with open(fname, 'w') as f:
        config['experimental'] = 'enabled'
        json.dump(config, f, indent=4)


if __name__ == '__main__':
    main()
```

## Conclusion

We now have our own cross-compile-ready base images - and the possibility to create more. <br>
The Resin images we used previously worked, but added (for us) unneccessary extra packages. There also was no Python 3.7 image available.

After creating our images we could upgrade all our services to Python 3.7. While not absolutely critical, it is still nice to use the latest and greatest version.


[xcompile-1]: ./20180314_docker_crosscompilation
[xcompile-2]: ./20180522_crosscompilation_revisited
[manifest]: https://docs.docker.com/edge/engine/reference/commandline/manifest/
[build-guide]: https://www.hotblackrobotics.com/en/blog/2018/01/22/docker-images-arm/
[docker-cli]: https://docs.docker.com/engine/reference/commandline/build/#options
[python-amd]: https://hub.docker.com/r/amd64/python/
[python-arm]: https://hub.docker.com/r/arm32v7/python/
