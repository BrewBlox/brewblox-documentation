"""
Code example for synchronizing data from an external sensor to a Spark sensor

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
API_TOPIC = 'brewcast/spark/blocks'

# We'll be using the 'patch' command
# 'create', 'write', and 'delete' are also available
# https://brewblox.netlify.app/dev/reference/blocks_api.html
TOPIC = API_TOPIC + '/patch'

# Create a websocket MQTT client
client = mqtt.Client()

try:
    client.connect_async(host=HOST, port=PORT)
    client.loop_start()

    value = 20

    while True:
        # Randomize value, so we can easily see the change in the UI
        value += ((random() - 0.5) * 10)

        # IMPORTANT !!
        # Don't forget to first create the 'Tutorial Sensor' block
        # Patch writes to non-existent blocks will be ignored

        message = {
            # The block ID
            'id': 'Tutorial Sensor',

            # The unique service name
            'serviceId': 'spark-one',

            # https://brewblox.netlify.app/dev/reference/block_types.html#tempsensorexternal
            'type': 'TempSensorExternal',

            # We only write the field we want to change
            # Because we're using patch, the other settings will remain unchanged
            'data': { 'setting[degC]': value },
        }

        client.publish(TOPIC, json.dumps(message))
        print(f'sent {message}')
        sleep(5)

finally:
    client.loop_stop()
