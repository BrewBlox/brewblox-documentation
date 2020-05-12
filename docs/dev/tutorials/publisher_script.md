# Publishing data in a script

The most common use case for integration with Brewblox is "I want to see my data in a graph".
You can do that by publishing your data to the Brewblox eventbus.

This tutorial shows you how to send data to a RabbitMQ eventbus, and run the script in a Docker container.
It assumes you're either familiar with Docker, or have followed the [dockerized script](./container_script) tutorial.

This script can be combined with [reading a serial port](./serial_script).

## Source code

On your Pi, create a new directory `pubscript`. In it, create two files:

**script.py**

```python
"""
Code example for publishing data to the Brewblox eventbus

Dependencies:
- pika
"""

import json
from random import random
from time import sleep

import pika

# 172.17.0.1 is the default IP address for the host running the Docker container
# Change this value if Brewblox is installed on a different computer
HOST = '172.17.0.1'

# This is a constant value. You never need to change it.
EXCHANGE = 'brewcast.history'

# This will be the top-level key in graphs / metrics
SERVICE = 'pubscript'

# Connect to the eventbus
connection = pika.BlockingConnection(pika.ConnectionParameters(host=HOST))
channel = connection.channel()

try:
    value = 20

    while True:
        # Replace this with actual data
        # See: https://brewblox.netlify.app/dev/reference/event_logging.html#history
        value += ((random() - 0.5) * 10)
        message = {'value[degC]': value}
        text = json.dumps(message)

        channel.basic_publish(exchange=EXCHANGE,
                              routing_key=SERVICE,
                              body=text)

        print(f'sent {message}')
        sleep(5)
finally:
    connection.close()

```

**Dockerfile**

```Dockerfile
FROM python:3.7-slim

COPY script.py /app/script.py

RUN pip3 install pika

CMD ["python3", "/app/script.py"]

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

## Editing docker-compose.yml

To access the eventbus, you will need to either add your container to the docker-compose.yml file, or expose the eventbus port. In this tutorial we will take the second approach.

Edit `docker-compose.yml`, and add the following configuration under `services`:
```yaml
  eventbus:
    ports:
    - "5672:5672"
```

Example configuration:

```yaml
services:
  spark-one:
    command: --name=spark-one --mdns-port=${BREWBLOX_PORT_MDNS} --discovery=wifi
    image: brewblox/brewblox-devcon-spark:${BREWBLOX_RELEASE}
    labels:
    - traefik.port=5000
    - 'traefik.frontend.rule=PathPrefix: /spark-one'
    privileged: true
    restart: unless-stopped
  eventbus:
    ports:
    - "5672:5672"
version: '3.7'
```

## Running

To run the built image:
```
docker run --rm --tty pubscript
```

This is exactly the same as the command in [the dockerized script tutorial](./container_script).
