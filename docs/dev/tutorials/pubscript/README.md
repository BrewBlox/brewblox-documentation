# Publishing data in a script

The most common use case for integration with Brewblox is "I want to see my data in a graph".
You can do that by publishing your data to the Brewblox eventbus.

This tutorial shows you how to send data to the Brewblox eventbus, and run the script in a Docker container.
It assumes you're either familiar with Docker, or have followed the [dockerized script](../brewscript/) tutorial.

This script can be combined with [reading a serial port](../serialscript/).

## Source code

On your Pi, create a new directory `pubscript`. In it, create two files:

**script.py**

<<< @/docs/dev/tutorials/pubscript/script.py

**Dockerfile**

```Dockerfile
FROM python:3.7-slim

COPY script.py /app/script.py

RUN pip3 install paho-mqtt

CMD ["python3", "-u", "/app/script.py"]

```

## Building

Your `pubscript` directory should look like this:
```
.
├── script.py
└── Dockerfile
```

To build the image, run:
```
docker build --tag pubscript pubscript/
```

## Running

To run the built image:
```
docker run --rm --tty pubscript
```

This is exactly the same as the command in [the dockerized script tutorial](../brewscript/).


## Testing

It's often useful to listen in on what messages the eventbus actually received.

You can do so using https://mitsuruog.github.io/what-mqtt/.
Connect to `wss://PI_ADDRESS:HTTPS_PORT/eventbus`, and listen to your published topic.

Example address: `wss://192.168.2.11:443/eventbus`.
Example topic: `brewcast/history/pubscript` (default in script.py)

You can also listen to all messages published to history by subscribing to `brewcast/history/#`. This will get very spammy if there are multiple services publishing data.
