"""
Code example for publishing data to the Brewblox eventbus

Dependencies:
- paho-mqtt
"""

import json
from random import random
from time import sleep

from paho.mqtt import client as mqtt

# 172.17.0.1 is the default IP address for the host running the Docker container
# Change this value if Brewblox is installed on a different computer
HOST = '172.17.0.1'

# 1883 is the default port for MQTT, but this can be changed in brewblox env settings.
PORT = 1883

# This is a constant value. You never need to change it.
HISTORY_TOPIC = 'brewcast/history'

# The history service is subscribed to all topics starting with 'brewcast/history'
# We can make our topic more specific to help debugging
TOPIC = HISTORY_TOPIC + '/pubscript'

# Create an MQTT client
client = mqtt.Client()

try:
    client.connect_async(host=HOST, port=PORT)
    client.loop_start()

    value = 20

    while True:
        # https://www.brewblox.com/dev/reference/history_events.html
        value += ((random() - 0.5) * 10)
        message = {
            'key': 'pubscript',
            'data': {'value[degC]': value}
        }

        client.publish(TOPIC, json.dumps(message))
        print(f'sent {message}')
        sleep(5)

finally:
    client.loop_stop()
