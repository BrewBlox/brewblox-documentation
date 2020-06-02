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
