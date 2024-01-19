# Docker: Schedule Jobs

In the other tutorials, we've looked at [polling a HTTP server and building a Docker container](../brewscript/), [reading from a serial port](../serialscript/), and [publishing to the history database](../pubscript/).

All these scripts were using an interval of a few seconds at most. Sometimes that's way too often.
For example: [Brewfather requires a minimum interval of 15 minutes](https://docs.brewfather.app/integrations/custom-stream).

Simply adding a sleep() call for 15 minutes is a very unreliable solution. If your service stops or crashes, it will cancel the interval, leading to very short or very long gaps.

A more practical solution is to use the [schedule](https://github.com/dbader/schedule) package.

## Source code

On your Pi, create a new directory `scheduledscript`. in it, create two files:

**script.py**

<<< @/dev/tutorials/scheduledscript/script.py

**Dockerfile**

<<< @/dev/tutorials/scheduledscript/Dockerfile

## Building

Your `scheduledscript` directory should look like this:

```txt
.
├── script.py
└── Dockerfile
```

To build the image, run:

```sh
docker build --tag scheduledscript scheduledscript/
```

## Running

To run the built image:

```sh
docker run --rm --tty scheduledscript
```

This is exactly the same as the command in [the dockerized script tutorial](../brewscript/).

## Testing

It's often useful to listen in on what messages the eventbus actually received.

You can do so using <https://mqtt-explorer.com/>.
Connect to `mqtt://PI_ADDRESS:1883`, and you can see all published events.
