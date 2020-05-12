# Creating a dockerized script

Brewblox is built on the concept of [services](https://github.com/BrewBlox/brewblox-boilerplate), but not all functionality requires a HTTP server and a deployed application.

This tutorial shows you how to create a simple python script, and run it in a Docker container.
You can build and run this on the same Raspberry Pi that's running Brewblox.

## Why Docker

You can probably install and run your script directly on your Pi.
We recommend using a container for the same reason we are using them: because it's cleaner.

If you remove a container, everything in it is gone. This includes leftover files, settings, and installed packages from your experiments.
You restart the container, and you get the exact same environment every time.
You reinstall your Pi, and your container is guaranteed to work out of the box, because it does not have dependencies on some obscure setting you changed once and then forgot about.

## Getting started

::: tip
This tutorial involves running code on your Raspberry Pi. [The remote development tutorial](./remote_scripts) explains how to easily copy files, or edit them directly on the Pi.
:::

Create a new directory called `brewscript`. You can do this on your Pi by using `mkdir brewscript`.

## Python script

As an example, we'll build a short script that fetches data from your Spark service every few seconds.

The script below uses a python package (requests), and fetches the blocks from your spark service every 10 seconds.

Copy the code to `brewscript/script.py`. We'll be using it in the next steps.

```python
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
```


## Dockerfile

Next, we need a Dockerfile. This contains instructions for building an *Image*.
The image is a blueprint for starting a new *Container*.
Every container started from the same image is identical.

Copy the code below to `brewscript/Dockerfile`, and we'll get started using it.

```Dockerfile
# We use the official `python` image as base.
FROM python:3.7-slim

# Copy the python script into the image
# Syntax: `COPY [SOURCE] [DESTINATION]`
COPY script.py /app/script.py

# We need to run commands while building the image
# This will install the `requests` package so we can use it in script.py
RUN pip3 install requests

# The command is executed when the container starts
CMD ["python3", "/app/script.py"]
```

## Building

After the previous steps, your `brewscript` directory should look like this:
```
.
├── Dockerfile
└── script.py
```

To build the image, run:
```
docker build --tag brewscript brewscript/
```

You now have your very own Docker image!
It's saved locally on your Pi. You can upload it to [Docker hub](https://hub.docker.com/) if you have a (free) account, but this is not required.

## Running

To run the built image:
```
docker run --rm --tty brewscript
```

The command is using the following arguments:
- `--rm` removes the container after it stops. This prevents leftovers.
- `--tty` (or `-t`) assigns a tty to the container, to immediately see print() output.
- `brewscript` is the name of the Docker image.

If you want to run the container in the background, use:
```
docker run --rm --detach brewscript
```

You will not see the output in your terminal, but the container will keep running while you use different commands.

To see all active containers, use
```
docker ps
```