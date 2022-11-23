# Publishing data in a script

The most common use case for integration with Brewblox is "I want to see my data in a graph".
You can do that by publishing your data to the Brewblox eventbus.

Once you have published the data, you can view it using the *Graph* and *Metrics* widgets.
The new fields should appear immediately when you next open the widget settings.

This tutorial shows you how to send data to the Brewblox eventbus, and run the script in a Docker container.
It assumes you're either familiar with Docker, or have followed the [dockerized script](../brewscript/) tutorial.

This script can be combined with [reading a serial port](../serialscript/).

## Source code

On your Pi, create a new directory `pubscript`. In it, create two files:

**script.py**

<<< @/docs/dev/tutorials/pubscript/script.py

**Dockerfile**

<<< @/docs/dev/tutorials/pubscript/Dockerfile

## Building

Your `pubscript` directory should look like this:

```txt
.
├── script.py
└── Dockerfile
```

To build the image, run:

```sh
docker build --tag pubscript pubscript/
```

## Running

To run the built image:

```sh
docker run --rm --tty pubscript
```

This is exactly the same as the command in [the dockerized script tutorial](../brewscript/).

## Testing

It's often useful to listen in on what messages the eventbus actually received.

You can do so using <https://mqtt-explorer.com/>.
Connect to `mqtt://PI_ADDRESS:1883`, and you can see all published events.
