# Getting Started

This guide describes how to install the BrewBlox system on a Raspberry Pi. </br>
The default device for the BrewBlox system is the BrewPi Spark, but you can try this tutorial without it.

For more advanced users, there are alternative ways for configuring and using the system. These are described in the [Advanced](./advanced.md) page.

## What you will need

Always:
* Laptop or desktop computer
* [Raspberry Pi 3](https://www.raspberrypi.org/products/) minicomputer
* Raspberry Pi power supply (5V to micro USB)
* MicroSD card
* MicroSD card reader
* Wifi network or ethernet cable

When connecting the BrewPi Spark
* BrewPi Spark
* Micro-USB to USB cable

::: tip
You can also install BrewBlox on a desktop computer, or install the Raspberry Pi using SSH. </br>
See the [Advanced](./advanced.md) page for instructions.
:::

## Step 1: Format the microSD card

Download the required software:
* [Raspbian OS](https://www.raspberrypi.org/downloads/raspbian/)
* [Etcher](https://www.balena.io/etcher/) for writing the image to the microSD card.

Insert your microSD card in the card reader, and connect the reader to your computer.

Now use Etcher to write it to your microSD card. Make sure to safely eject the microSD card before removing it from the card reader.

![Etcher](../images/etcher.jpg)

For more information, see the [official Raspberry install guide](https://www.raspberrypi.org/documentation/installation/installing-images/README.md).

## Step 2: Enable SSH and WiFi

By default, SSH is disabled on the Pi.
It can be enabled after Etcher has written the Raspbian image to the microSD card.

After writing the image, it will be recognized by the OS as a removable drive with two partitions. <br> Open the `boot` partition, and create an empty `ssh` file. (No extensions or content.)
SSH will now be enabled when the Pi boots.

To configure WiFi, create the `wpa_supplicant.conf` file in the `boot` partition.

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


## Step 3: Connect to the Raspberry Pi

::: warning
Make sure the power supply is disconnected at this point.
:::

On your desktop computer, you need an SSH client. This is already available on Linux and OSX, but must be installed on Windows. <br>
Popular choices are [PuTTY](https://www.putty.org/) and [Git Bash](https://git-scm.com/download/win).

After you installed your SSH client, insert the microSD card into your Pi, and connect the power supply. The Pi will start automatically.

Wait for the Pi to finish starting up, and connect to it using your SSH client.

The default user name is `pi`, and the default password is `raspberry`. It is strongly advised to change the password immediately.

## Step 4: Install BrewBlox

Open the terminal, and run the following commands:

```bash
sudo apt update && sudo apt install -y python3-pip
sudo pip3 install -U brewblox-ctl
```

This script installs `brewblox-ctl`, a menu for installing and managing your BrewBlox system. <br>
To install a new system, run the following command:

```bash
brewblox-ctl install
```

This will walk you through the relevant choices, and then install BrewBlox in a directory of your choice.

## Step 5: Flash the firmware

Navigate to the directory you chose during the installation (default: `./brewblox`), and run the following commands in your terminal:

```bash
brewblox-ctl flash
brewblox-ctl bootloader
brewblox-ctl wifi
```

Follow the instructions until the menu exits.

## Step 6: First-time setup

To finish the installation, and initialize your system, run the first-time setup script.

Navigate to the directory you chose during the installation (default: `./brewblox`), and run the following command in your terminal:

```bash
brewblox-ctl setup
```

Follow the instructions until the menu exits.

## Step 7: Start the system

If you connected your Spark to your Wi-Fi network, you can now disconnect from your Raspberry Pi, and connect the Spark to some other power source.

Navigate to the directory you chose during the installation (default: `./brewblox`), and start the menu:

```bash
brewblox-ctl
```

You can use the menu to easily manage your system, and perform common actions. Choose `up` to start your system.

![BrewBLox Menu](../images/menu-screenshot.png)


After the project is done starting up, you can use the BrewBlox UI at `https://raspberrypi` (or your Raspberry Pi's IP address) to configure and monitor your Spark.

::: warning
Because we're using a local (self-signed) SSL certificate, your browser will display a warning the first time you visit the page.

There's no need to panic. Click advanced, and add an exception for the current host.
![BrewBlox UI](../images/ssl-error.png)
:::

## Step 8: Done!

![BrewBlox UI](../images/brewblox-ui.png)
