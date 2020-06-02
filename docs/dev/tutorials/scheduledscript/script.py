"""
Code example for publishing data to the Brewblox eventbus on a fixed schedule

Dependencies:
- pika
- schedule
"""

import json
from random import random
from time import sleep

import pika
import schedule

# 172.17.0.1 is the default IP address for the host running the Docker container
# Change this value if Brewblox is installed on a different computer
HOST = '172.17.0.1'

# This is a constant value. You never need to change it.
EXCHANGE = 'brewcast.history'

# This will be the top-level key in graphs / metrics
SERVICE = 'scheduledscript'

def publish():

    # Connect to the eventbus
    # The interval can be pretty long. We open a new connection every time.
    connection = pika.BlockingConnection(pika.ConnectionParameters(host=HOST))
    channel = connection.channel()

    try:
        value = 20 + ((random() - 0.5) * 10)
        message = {'value[degC]': value}
        text = json.dumps(message)
        channel.basic_publish(exchange=EXCHANGE,
                              routing_key=SERVICE,
                              body=text)

        print(f'sent {message}')
    finally:
        connection.close()

# For more examples on how to schedule tasks, see:
# https://github.com/dbader/schedule
schedule.every().minute.at(':05').do(publish)

while True:
    schedule.run_pending()
    sleep(1)
