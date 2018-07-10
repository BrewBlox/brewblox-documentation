# Advanced Tutorials

For people comfortable using command-line applications, there are some alternatives for configuring and using the BrewBlox system.

These tutorials are an extension of the default [Getting Started guide](./startup.md).

## SSH configuration

Attaching a monitor and keyboard to the Raspberry Pi is optional. </br>
An alternative is to enable SSH, and configure the system from your own computer.

By default, SSH is disabled on the Pi.
It can be enabled after Etcher has written the Raspbian image to the microSD card.

After writing the image, it will be recognized by the OS as a removable drive with two partitions. Open the `/boot/` partition, and create an empty `ssh` file. (No extensions or content.)
SSH will now be enabled when the Pi boots.

To configure WiFi, create the `/etc/wpa_supplicant/wpa_supplicant.conf` file in the root partition.

The file contents should be: 

```
country=YOUR_COUNTRY_CODE

ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev

update_config=1

network={
   ssid="YOUR_WIFI_NAME"
   psk="YOUR_WIFI_PASSWORD"
}
```

Replace `YOUR_COUNTRY_CODE`, `YOUR_WIFI_NAME`, and `YOUR_WIFI_PASSWORD` with the relevant values.

## Managing BrewBlox using the terminal

BrewBlox is a set of [Docker](https://docs.docker.com/) containers, managed by [docker-compose](https://docs.docker.com/compose/). </br>
The Compose UI also runs inside a Docker container, and uses the docker-compose Python API.

The default BrewBlox projects are installed in the `pi` user root directory (`/home/pi`).

To get started with docker-compose, you can find a tutorial [here](https://docs.docker.com/compose/gettingstarted/#step-3-define-services-in-a-compose-file).

::: warning 
The Raspberry Pi uses the `ARM32v7` processor architecture. This is supported by most [official Docker images](https://hub.docker.com/explore/), but not all.

All BrewBlox images built for the Pi have their version prefixed with `rpi-`. (Example: `brewblox/brewblox-history:rpi-latest`).
:::

## Installing BrewBlox on a desktop computer

BrewBlox can be installed on any system that has Docker installed.

Installing Docker is easy on [Ubuntu Linux](https://docs.docker.com/install/linux/docker-ce/ubuntu/) or [Mac](https://docs.docker.com/docker-for-mac/install/#install-and-run-docker-for-mac), but more complicated for [Windows](https://docs.docker.com/docker-for-windows/install/).

Docker-compose files must be adjusted between desktop and Pi versions, to account for the different architecture. Usually this means changing the version tag, but occasionally the Pi uses third-party images of external applications (eg. InfluxDB, Compose UI).

BrewBlox images are always published for both architectures: simply remove the `rpi-` prefix to get the desktop version.
