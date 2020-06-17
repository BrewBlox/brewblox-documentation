# Scheduling jobs in Python

In the other tutorials, we've looked at [polling a HTTP server and building a Docker container](../brewscript/), [reading from a serial port](../serialscript/), and [publishing to the history database](../pubscript/).

All these scripts were using an interval of a few seconds at most. Sometimes that's way too often.
For example: [Brewfather requires a minimum interval of 15 minutes](https://docs.brewfather.app/integrations/custom-stream).

Simply adding a sleep() call for 15 minutes is a very unreliable solution. If your service stops or crashes, it will cancel the interval, leading to very short or very long gaps.

A more practical solution is to use the [schedule](https://github.com/dbader/schedule) package.

## Source code

On your Pi, create a new directory `scheduledscript`. in it, create two files:

**script.py**

<<< @/docs/dev/tutorials/scheduledscript/script.py

**Dockerfile**

```Dockerfile
FROM python:3.7-slim

COPY script.py /app/script.py

RUN pip3 install paho-mqtt schedule

CMD ["python3", "-u", "/app/script.py"]

```

## Building

Your `scheduledscript` directory should look like this:
```
.
├── script.py
└── Dockerfile
```

To build the image, run:
```
docker build --tag scheduledscript scheduledscript/
```

## Running

To run the built image:
```
docker run --rm --tty scheduledscript
```

This is exactly the same as the command in [the dockerized script tutorial](../brewscript/).
