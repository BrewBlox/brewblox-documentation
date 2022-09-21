# Profiling services

A profiler is one of the more useful tools for finding performance bottlenecks in code.

There are multiple profilers available for Python. We'll be using the [profiling package](https://github.com/what-studio/profiling), as it works well with our "web server in a docker container" runtime.

## Setting up

We'll be using the brewblox-devcon-spark service as example.

Run `poetry add profiling`. We'll need this package available both in the (Docker) runtime, and in the local poetry virtualenv.

Append the following lines to your Dockerfile:

```docker
RUN apt-get update -q && apt-get install -qy locales
RUN sed -i -e 's/# en_US.UTF-8 UTF-8/en_US.UTF-8 UTF-8/' /etc/locale.gen
RUN locale-gen

ENTRYPOINT ["profiling", "remote-profile", "--bind", "0.0.0.0:8912", "-m", "brewblox_devcon_spark", "--"]
```

As these changes are strictly local-only, you don't need to worry about layer optimizations in your Dockerfile.

Now build your image:

```sh
bash docker/before_build.sh
docker build -t profiled:local docker
```

Now either use a docker-compose.override.yml file with:

```yml
  sparkey:
    image: profiled:local
    ports:
      - "8912:8912"
```

Or edit the config in your docker-compose.yml file:

```yml
  sparkey:
    # ------ new -----------------------
    ports:
      - "8912:8912"
    # ------ changed -------------------
    image: profiled:local
    # ------ pre-existing --------------
    restart: unless-stopped
    privileged: true
    volumes:
      - ./dev/simulator__sparkey:/app/simulator
    command: --name=sparkey --simulation --device-id=123456789012345678901234
```

## Running

Start your docker services with `docker-compose up -d`.
Check whether your service started OK with `docker-compose logs --follow sparkey`.

In your repository dir, activate your poetry virtualenv, and view the output.

```sh
poetry shell
profiling view localhost:8912
```

## Mapped code volumes

You can make code changes without rebuilding your Docker image by mapping a volume to your code repository:

```yml
  sparkey:
    volumes:
      - ../brewblox-devcon-spark/brewblox_devcon_spark:/app/brewblox_devcon_spark
```

Normally, you can then apply your code changes by running `docker-compose restart sparkey`. This does not work when profiling: the profiling process is forcibly closed, and after the restart it will be unable to reclaim its bound port.
To prevent this, use:

```sh
docker-compose up -d --force-recreate sparkey
```

## Cleanup

When you're done, undo the changes to tracked files.
It's recommended to use `poetry remove profiling` to also remove the installed package.
