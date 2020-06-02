# Reading the Raspberry Pi serial port

Many related devices and sensors publish their data directly to a serial port.
This includes connected Arduinos.

This tutorial shows you how to read from a serial port while inside a Docker container.
It assumes you're either familiar with Docker, or have followed the [dockerized script](../brewscript/) tutorial.

## Source code

On your Pi, create a new directory `serialscript`. In it, create two files:

**script.py**

<<< @/docs/dev/tutorials/serialscript/script.py

**Dockerfile**

```Dockerfile
FROM python:3.7-slim

COPY script.py /app/script.py

RUN pip3 install pyserial

CMD ["python3", "/app/script.py"]

```

## Building

Your `serialscript` directory should look like this:
```
.
├── script.py
└── Dockerfile
```

To build the image, run:
```
docker build --tag serialscript serialscript/
```


## Running

To access the serial port on the host computer, your Docker container needs elevated privileges.

Start the container by running:
```
docker run --rm --privileged --tty --volume /dev:/dev serialscript
```

- `--rm` removes the container after it stops. This prevents leftovers.
- `--tty` (or `-t`) assigns a tty to the container, to immediately see print() output.
- `--privileged` gives the container the required permissions to use the serial port.
- `--volume /dev:/dev` lets the container 'see' the serial port.
- `serialscript` is the name of the Docker image.

::: warning
`--volume /dev:/dev` also lets the container see all files on the host.
Be careful when using this, and avoid exposing ports on this container.
:::
