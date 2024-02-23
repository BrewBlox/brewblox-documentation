# Pi Alternatives

By default, we recommend installing Brewblox on a Raspberry Pi.
This is a cheap and simple way to have a dedicated server.
As with anything else, there are tradeoffs, and you may prefer an alternative solution.

## Basic requirements

We try to minimize the requirements for Brewblox, to make it widely compatible.
The core requirements are:

- Docker
- Docker Compose
- Python 3
- `sh`

**Linux** is mostly supported, with the exception of some very niche distributions.\
On Debian, Ubuntu, and Linux Mint, everything works out of the box.
On other Linux systems, some dependencies must be installed manually, as we only check for the `apt-get` system package manager.

**[Synology NAS](https://www.synology.com/en-global)** systems are officially supported and actively tested.

**Mac** is not officially supported, but it is possible to install Brewblox after manually installing dependencies.
We do not actively test new features on Mac systems, but if you have a problem, we're happy to take a look on a case-by-case basis.

**Windows** can't be used, as it has no native support for Docker.
This limitation can be avoided by using [Windows Subsystem for Linux](https://docs.microsoft.com/en-us/windows/wsl/install), but this is a solution for expert users, and comes with its own drawbacks.

## Pi models

Not all Raspberry Pi models are created equal, and not all of them can run Brewblox.

The Pi Zero and 1 are not supported.
This is a hard limitation: we do not support their ARMv6 processor architecture.

The Pi 2 is compatible, but not recommended. While it can run Brewblox, it will be slow, and you cannot use some of the more memory-hungry optional services.\
You will not be able to run the desktop environment in combination with Brewblox.

This leaves the Pi 3, 4, 5, and 400.

The Pi 3 is fully supported, and serves as a baseline for our tests.
We still recommend using the Lite version of the Raspberry Pi OS, as the desktop environment uses significant amounts of CPU and RAM.

The Pi 5 is the most recent model. Multiple versions are available, with 1GB, 2GB, 4GB or 8GB RAM.
If you wish to use the desktop environment, we recommend using a 4GB or 8GB version.\
From the Pi 4 up, USB 3.0 ports are available. This allows for replacing the SD card with an SSD as the primary storage device. More on this below.

The Pi 400 has the same hardware specs as the Pi 4.

## Reliability

Especially for its price, the Raspberry Pi itself is exceedingly reliable.
If you mount one in your setup, you can expect it to run smoothly for years. A typical Pi will be replaced not because of hardware failure, but because it has become obsolete.

One notable exception to this longevity is the SD card, as it will fail after a finite number of disk writes. More on this below.

## SD cards: speed

Not all SD cards are created equal. They vary not only in size, but also in read/write speed.

Each SD card will show its speed, expressed as its *Speed Class*, *UHS Speed Class*, or *Video Speed Class*.
For Brewblox, a write speed of 10MB/s is the practical minimum. This corresponds to Speed Class 10, UHS Speed Class 1, or Video Speed Class 10.

For a complete overview of SD speed standards, see [this page](https://www.sdcard.org/developers/sd-standard-overview/speed-class/).

## SD cards: lifespan

Unlike the rest of the Pi, the SD cards used for persistent storage have a very limited lifespan, measured in number of writes per disk sector.\
Brewblox is especially impactful, as it writes history data to disk every few seconds.

The expected lifespan of a 32GB card in an active Brewblox setup is somewhere between 1 and 2 years. After that it will slow down and then fail.

Writes are equally spread out among disk sectors. Larger cards will consequently take longer to degrade.
We personally consider 64GB or 128GB to be a good balance between longevity and cost.

For the Raspberry Pi 4 and up, the problem can be avoided entirely by using a SSD or HDD instead, connected using a M.2 or SATA to USB 3.0 adapter.
In our tests, this also markedly increased performance.

For instructions, see [this guide](https://www.tomshardware.com/how-to/boot-raspberry-pi-4-usb).

For a list of compatible disks and adapters, see [this page](https://jamesachambers.com/best-ssd-storage-adapters-for-raspberry-pi-4-400/).
Note that we are not affiliated or involved with this page in any way, and have not independently verified all listed devices.

## Display monitors

It is somewhat common for users to mount a screen in their brewery to display the UI in kiosk mode.

Unless you're using at least a Pi 4 with 4GB+ RAM, we recommend using a separate device for this.
It's not guaranteed to fail, but it makes it significantly more likely that a spike in memory usage will cause a random process on the Pi to be terminated.
