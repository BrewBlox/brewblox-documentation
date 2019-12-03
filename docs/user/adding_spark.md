# Adding a Spark service

After you've followed the [Getting Started guide](./startup.html), you may want to connect your second or third Spark.

The [Multiple Devices](./multiple_devices.html) guide explains how Services work in BrewBlox. This guide walks you through the steps to add a new Spark service.

## What you will need

* Existing BrewBlox installation
* BrewPi Spark
* Micro-USB to USB cable

## Step 1: Stop your system

You'll be changing the configuration of your BrewBlox system. For the changes to take effect, you must stop and start your system.

In your BrewBlox directory (default: `./brewblox`), run this command:

```bash
brewblox-ctl down
```

## Step 2: Flash the firmware

::: warning
Make sure no other Sparks are connected over USB while you're flashing your controller.
:::

In your BrewBlox directory (default: `./brewblox`), run these command:

```bash
brewblox-ctl flash
brewblox-ctl wifi
```

Follow the instructions until the menu exits.

## Step 3: Edit configuration

We will be using the `brewblox-ctl add-spark` command to add the service. 

This command takes (optional) arguments that change how the service will communicate with the controller. The [Adding Spark](./adding_spark.html) guide describes these arguments in detail.

Some arguments that can be set:
- `--device-id`: If you already know the device ID.
- `--device-host`: If your Spark controller has a fixed IP address, you can skip discovery, and immediately connect to its IP address. You must assign the Spark controller a static DHCP lease in your router for this to work.
- `--discovery`: If you want to restrict device discovery to only use USB (`--discovery=usb`), or only use Wifi (`--discovery=wifi`).

If you run `brewblox-ctl add-spark` without arguments, it will prompt you for its unique service name, and let you choose from discovered devices.

## Step 4: Add the service in the UI

When adding your service, the `Service ID` field must match the name you gave the service in `brewblox-ctl add-spark`. The `Service title` field is not important for configuration: pick a name that makes sense to you.

![Adding service](../images/adding-service.gif)
