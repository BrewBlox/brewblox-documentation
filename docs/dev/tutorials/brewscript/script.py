"""
Code example for polling data from Spark services

Dependencies:
- requests
"""

from time import sleep

import requests
import urllib3
from requests.exceptions import ConnectionError, HTTPError

# 172.17.0.1 is the default IP address for the host running the Docker container
# Change this value if Brewblox is installed on a different computer
HOST = '172.17.0.1'

# The Spark service name. Change it if yours is called something else.
SERVICE = 'spark-one'
URL = f'https://{HOST}/{SERVICE}/logged_objects'

# Brewblox uses a self-signed SSL certificate
# This causes a warning
urllib3.disable_warnings()

print(f'Polling {URL}. To exit press Ctrl+C')

while True:
    try:
        sleep(10)
        resp = requests.get(URL, verify=False)
        resp.raise_for_status()

        # For now we just print the response data
        print(resp.json())

    except (HTTPError, ConnectionError) as ex:
        # We don't want the script to exit when we get a HTTP error
        # These are probably caused by the Spark service not being available (yet)
        print(f'Error: {ex}')
