"""
Code example for publishing data to the Brewblox eventbus on a fixed schedule

Dependencies:
- paho-mqtt
- schedule
"""

import json
from random import random
from time import sleep

import schedule
from paho.mqtt import client as mqtt

# 172.17.0.1 is the default IP address for the host running the Docker container
# Change this value if Brewblox is installed on a different computer
HOST = '172.17.0.1'

# 80 is the default port for HTTP, but this can be changed in brewblox env settings.
PORT = 80

# This is a constant value. You never need to change it.
HISTORY_TOPIC = 'brewcast/history'

# The history service is subscribed to all topics starting with 'brewcast/history'
# We can make our topic more specific to help debugging
TOPIC = HISTORY_TOPIC + '/scheduledscript'

# Create a websocket MQTT client
client = mqtt.Client(transport='websockets')
client.ws_set_options(path='/eventbus')


def publish():

    try:
        client.connect_async(host=HOST, port=PORT)
        client.loop_start()

        # https://brewblox.netlify.app/dev/reference/history_events.html
        value = 20 + ((random() - 0.5) * 10)
        message = {
            'key': 'scheduledscript',
            'data': {'value[degC]': value}
        }

        client.publish(TOPIC, json.dumps(message))
        print(f'sent {message}')

    finally:
        client.loop_stop()


# For more examples on how to schedule tasks, see:
# https://github.com/dbader/schedule
schedule.every().minute.at(':05').do(publish)

while True:
    schedule.run_pending()
    sleep(1)
