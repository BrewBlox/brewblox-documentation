# Synchronizing an external sensor

If you wish to use external sensors that can't be plugged into a Spark,
you can synchronize its measured value using a *Temp Sensor (External)* block.

You manually push new values to this block, and the Spark will treat it as any other sensor.
To improve safety, the block has a timeout setting.
If the timeout is 5m, then if no new value has been written for 5 minutes, the Spark will consider the sensor disconnected, and stop using its value.

You can find the type documentation in the [block data types page](../../reference/block_types.md).

This tutorial shows you how to change block data using the Brewblox eventbus, and run the script in a Docker container.
It assumes you're either familiar with Docker, or have followed the [dockerized script](../brewscript/) tutorial.

This script can be combined with [reading a serial port](../serialscript/).

## Creating the block

First, in the UI create a new *Temp Sensor (External)* block. Call it **Tutorial Sensor**.

You can adjust its settings here. In the tutorial we will only be writing a new temperature value.
The `enabled` and `timeout` settings will not be changed.

## Source code

On your Pi, create a new directory `sensorscript`. In it, create two files:

**script.py**

<<< @/docs/dev/tutorials/sensorscript/script.py

**Dockerfile**

<<< @/docs/dev/tutorials/sensorscript/Dockerfile

## Building

Your `sensorscript` directory should look like this:

```txt
.
├── script.py
└── Dockerfile
```

To build the image, run:

```sh
docker build --tag sensorscript sensorscript/
```

## Running

To run the built image:

```sh
docker run --rm --tty sensorscript
```

## Testing

It's often useful to listen in on what messages the eventbus actually received.

You can do so using <https://mqtt-explorer.com/>.
Connect to `mqtt://PI_ADDRESS:1883`, and you can see all published events.
