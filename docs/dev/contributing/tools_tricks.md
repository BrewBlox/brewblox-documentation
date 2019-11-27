# Dev Tools and Tricks

In order to make development easier and quicker, we've created some tooling for common development actions.
Experience added a few tricks useful to the unabashedly lazy (also us).

These tools and tricks may not mesh with your personal habits, preferences, and dev environments, and are not required to write good and useful software.

That said, we quite like them, and felt it worthwhile to share.

## Running VSCode in Pipenv

VSCode has some support for Pipenv, and can automatically run `pipenv shell` when opening a terminal.

An alternative is to run VSCode inside the virtual environment. This ensures that all plugins and console commands automatically use the right python version and packages.

If you're unwilling to use `cd project-dir; pipenv run code .` every time you open a project, add this snippet to `~/.bashrc` or `~/.bash_aliases`.

```bash
_code=$(which code)
function code() {
    if [[ -d $1 ]]; then
        pushd $1 > /dev/null
        if [ -f "Pipfile" ] ; then
            echo "Opening in Pipenv..."
            pipenv run ${_code} . ${@:2}
        else
            ${_code} . ${@:2}
        fi
        popd > /dev/null
    else
        ${_code} $@
    fi
}
```

This replaces the `code` command with something that checks whether the target directory contains a Pipenv configuration file (Pipfile). If so, it uses `pipenv run` to start VSCode.

## brewblox-dev

The boilerplate repository has a dev dependency on `brewblox-dev`. This package is a collection of CLI functions to automate Continuous Deployment tasks.

The invidual commands will be available when you either run `pipenv shell`, or used the VSCode trick to run your entire editor in the pipenv virtual environment.

## brewblox-dev localbuild

The one-stop-shop for generating docker images. Also takes all default actions for building service images (running setup, copying code, generating requirements file, activating the QEMU cross compiler, etc)
Type `brewblox-dev localbuild --help` to see all arguments.

An overview of the most common and useful combinations:

```sh
brewblox-dev localbuild
```

Creates a local image. Reads your .env file for the `DOCKER_REPO` setting. 
For example, when used in `brewblox-devcon-spark`, it will create the `brewblox/brewblox-devcon-spark:local` image.

```sh
brewblox-dev localbuild --branch-tag
```

Creates a local image, but uses a sanitized version of the branch name as tag.
For example, when used in `brewblox-devcon-spark`, on the `feature/gadget` branch, it will create the `brewblox/brewblox-devcon-spark:feature-gadget` image.

```sh
brewblox-dev localbuild --arch amd --arch arm
```

By default, `brewblox-dev localbuild` only creates the AMD64 image. When also setting the `arm` argument to `--arch`, it will create an image that can be run on the Raspberry Pi. ARM image names are automatically prefixed with `rpi-`.

For example, when used in `brewblox-devcon-spark`, on the `feature/gadget` branch, it will create two images:
- `brewblox/brewblox-devcon-spark:feature-gadget`
- `brewblox/brewblox-devcon-spark:rpi-feature-gadget`

```sh
brewblox-dev localbuild --arch arm --branch-tag --push
```

You can use this to quickly create and push an image for testing on your Pi. This does require a Docker Hub account.

## brewblox-dev bump

If you're using semantic versioning, you can use this to increment the version tag in git.

Example call:

```sh
steersbob@BrewBox:~/git/brewblox-history$ brewblox-dev bump minor
Bumping "minor" version: 0.9.0 ==> 0.10.0
Do you want to tag the current commit with that version? [Y/n]
```

## Automatically using the git version in `setup.py`

In your `setup.py` file, make the following changes:

- Remove the `version='0.1.0'` argument
- Add the following two arguments:

```py
setup(
    use_scm_version={'local_scheme': lambda v: ''},
    setup_requires=['setuptools_scm'],
    # all other args
)
```

Now you only have to increment the git tag (with `brewblox-dev bump`), and the package version will follow.

## Directly testing code changes in docker-compose

Sometimes you have changes that must be tested in combination with other Docker containers. <br>
A good example is publishing messages to influx.

When developing this, you don't want to stop and recreate everything for every tiny code change.
This is where volumes are useful.

An example docker-compose configuration:

```yaml
version: '3'

services:

  eventbus:
    image: rabbitmq:alpine

  influx:
    image: influxdb

  datastore:
    image: treehouses/couchdb

  history:
    image: brewblox/brewblox-history:develop
    depends_on:
      - influx
      - eventbus
    labels:
      - "traefik.port=5000"
      - "traefik.frontend.rule=PathPrefix: /history"

  traefik:
    image: traefik
    command: -c /dev/null --api --docker --docker.domain=docker.localhost
    ports:
      - "80:80"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock

  sparksimulator:
    image: brewblox/firmware-simulator:develop

  spark:
    image: brewblox/brewblox-devcon-spark:develop
    privileged: true
    depends_on:
      - eventbus
      - datastore
      - sparksimulator
    labels:
      - "traefik.port=5000"
      - "traefik.frontend.rule=PathPrefix: /spark"
    volumes:
      - "./:/app/" # Magic happens here
    command: >
      --device-host=sparksimulator
```

For brewblox service images, the default working directory is `/app`. By mounting the current directory (your project root) here, the code in your project root will be imported when running the image.

Now when you run `docker-compose restart spark`, the `spark` service will restart using the code changes you just made - while all other services stay online.