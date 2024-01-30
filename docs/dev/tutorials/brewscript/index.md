# Docker: Create a Script

Brewblox is built on the concept of [services](https://github.com/BrewBlox/brewblox-boilerplate), but not all functionality requires a HTTP server and a deployed application.

This tutorial shows you how to create a simple python script, and run it in a Docker container.
You can build and run this on the same Raspberry Pi that's running Brewblox.

## Why Docker

You can probably install and run your script directly on your Pi.
We recommend using a container for the same reason we are using them: because it's cleaner.

If you remove a container, everything in it is gone. This includes leftover files, settings, and installed packages from your experiments.
You restart the container, and you get the exact same environment every time.
You reinstall your Pi, and your container is guaranteed to work out of the box, because it does not have dependencies on some obscure setting you changed once and then forgot about.

## Getting started

::: tip
This tutorial involves running code on your Raspberry Pi. [The remote development tutorial](../../deployment.md) explains how to easily copy files, or edit them directly on the Pi.
:::

Create a new directory called `brewscript`. You can do this on your Pi by using `mkdir brewscript`.

## Python script

As an example, we'll build a short script that fetches data from your Spark service every few seconds.

The script below uses a python package (requests), and fetches the blocks from your spark service every 10 seconds.

Copy the code to `brewscript/script.py`. We'll be using it in the next steps.

<<< @/dev/tutorials/brewscript/script.py

## Dockerfile

Next, we need a Dockerfile. This contains instructions for building an *Image*.
The image is a blueprint for starting a new *Container*.
Every container started from the same image is identical.

Copy the code below to `brewscript/Dockerfile`, and we'll get started using it.

<<< @/dev/tutorials/brewscript/Dockerfile

## Building

After the previous steps, your `brewscript` directory should look like this:

```txt
.
├── Dockerfile
└── script.py
```

To build the image, run:

```sh
docker build --tag brewscript brewscript/
```

You now have your very own Docker image!
It's saved locally on your Pi. You can upload it to [Docker hub](https://hub.docker.com/) if you have a (free) account, but this is not required.

## Running

To run the built image:

```sh
docker run --rm --tty brewscript
```

The command is using the following arguments:

- `--rm` removes the container after it stops. This prevents leftovers.
- `--tty` (or `-t`) assigns a tty to the container, to immediately see print() output.
- `brewscript` is the name of the Docker image.

If you want to run the container in the background, use:

```sh
docker run --rm --detach brewscript
```

You will not see the output in your terminal, but the container will keep running while you use different commands.

To see all active containers, use

```sh
docker ps
```
