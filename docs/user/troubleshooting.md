# Troubleshooting

We're happy to help with any problems or questions that arise when using Brewblox. You can reach us on the [forum](https://community.brewpi.com).

Our first reply often consists of the same handful of questions. To save you some time, you may want to run through this checklist first.

- Is your system and firmware up-to-date? You can run `brewblox-ctl update` to check, or find the latest release date in https://brewblox.netlify.com/user/release_notes.html
- `brewblox-ctl log` generates all kinds of logs and diagnostic data for us to look at. It will also create a termbin.com link. You can copy that URL in your post.
- In the UI sidebar, bottom left corner there is a "bug" button. Click here, and choose "Export API errors to file". Please attach this file to your post.
- If your Spark service page is working, it may be useful to include your Blocks. You can export them by clicking on the "Actions" button in the top right corner of the service page, and then choosing "Import/Export Blocks". Please attach the generated file to your post.

## Known issues / workarounds

::: tip
We quickly fix most bugs we find. Some of them can't be fixed immediately, but have a temporary workaround.

We keep this list updated with the issues we're aware of, but haven't yet permanently resolved.
:::

**During update, my Pi hangs while creating services**

The most likely cause for this is overflow in swap memory.

Especially if you have a Pi 3 or 4, you may see improvements when disabling swap memory altogether:

```
sudo dphys-swapfile swapoff
sudo dphys-swapfile uninstall
sudo update-rc.d dphys-swapfile remove
sudo rm -f /etc/init.d/dphys-swapfile

sudo service dphys-swapfile stop
sudo systemctl disable dphys-swapfile.service
sudo reboot
```

## Frequently asked questions

**No Spark controller detected (in service, or in brewblox-ctl)**

For reference, you can find the full guide on connection settings guide [here](./connect_settings.md).

*Is the Spark screen completely white, or completely black (but status LED is on)?*

This happens when the bootloader is outdated or not present.
To flash the bootloader, run:
```
brewblox-ctl particle -c flash-bootloader
```

The Spark screen should show six boxes on a dark background.

*USB: is the cable connected?*

Never hurts to check.

*USB: what is the output from the `lsusb` command?*

`lsusb` lists currently connected USB devices.

Example output:

```
pi@washberry:~ $ lsusb
Bus 001 Device 005: ID 2b04:c008
Bus 001 Device 004: ID 0781:5583 SanDisk Corp. Ultra Fit
Bus 001 Device 003: ID 0424:ec00 Standard Microsystems Corp. SMSC9512/9514 Fast Ethernet Adapter
Bus 001 Device 002: ID 0424:9514 Standard Microsystems Corp. SMC9514 Hub
Bus 001 Device 001: ID 1d6b:0002 Linux Foundation 2.0 root hub
```

The `xxxx:xxxx` section after `ID` is the relevant bit. This is the VID:PID (Vendor ID, Product ID) of each device.

The VID:PID for a Spark 2 is `2b04:c006`. <br>
The VID:PID for a Spark 3 is `2b04:c008`.

In the example, Bus 001 Device 005 is a Spark 3.

If your Spark is connected, but does not show up in this list, check again with a different USB cable.

*Wifi: is the Spark connected to Wifi?*

If the Spark LCD does not show an IP address, connect to it using USB, and configure Wifi:
- Open the Brewblox UI
- Go to the Spark service page
- Go to the actions menu in the top right corner
- Choose "Configure Wifi"

*Wifi: is the Spark accessible from your computer and the Raspberry Pi?*

- Can you visit the Spark IP in your browser? It should show a short placeholder message.
- If you run `brewblox-ctl http get <SPARK_IP>`, do you see the html for the placeholder message?

If the answer to either is no, your Spark and Pi are likely using different subnets in your home network. 
Check your router configuration to allow them to communicate.

If the answer to all questions is yes, but the service still can't find your Spark, it may be a problem with mDNS.

By default, we use [multicast DNS](https://en.wikipedia.org/wiki/Multicast_DNS) to discover Sparks that are not connected over USB. 
In most - but not all - routers, mDNS is enabled by default. Check your router configuration for settings related to multicast DNS.

If you can't solve the problem in your router settings, it may be preferable to skip discovery, 
and add `--device-host=SPARK_IP` to your docker-compose.yml file. 
You can find the syntax in the [connection settings guide](./connect_settings.md).

When doing so, it is advised to assign a fixed IP address to the Spark in your router settings. (Also called "static DHCP lease").

**How do I display temperature in Fahrenheit?**

This can be set separately for Spark service.

- Go to the Spark service page
- In the top right corner, click on the Actions button (three vertical dots).
- Click on `Configure used units`, and set desired values for the UI and the Spark Display.

**Why can removed or renamed blocks still be selected in the Graph Widget settings?**

History data is not changed when a block changes name. 
After a name change, the service simply starts publishing data under the new name.

The old name will disappear from the Graph widget settings 24 hours after the block is removed or renamed.

Units are part of the field name. For 24 hours after changing units from Celsius to Fahrenheit, 
you'll see both `spark-one/block/value[degC]` and `spark-one/block/value[degF]` in the Graph settings.

**My Pi suddenly reboots**

This is often caused by underpowered chargers, especially if the Pi reboots while pulling or starting Docker images.
For more information, see [the official power requirements page](https://www.raspberrypi.org/documentation/hardware/raspberrypi/power/README.md).
