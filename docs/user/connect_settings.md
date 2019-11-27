# Spark Connection Settings

The Spark service can connect to the controller using either Wifi, or USB. Once connected, there is no difference.

Connection settings are specified by editing the Spark service arguments in the `docker-compose.yml` file. See the [Multiple Devices](./multiple_devices.html) guide for an explanation on service configuration.

The service can either connect immediately to a fixed address, or first try to discover the controller address.

## What settings to use

There are multiple arguments you can use (and combine) to configure how the Spark Service connects to the Spark Controller.

**If: you want to make sure the service always connects to same controller**
- Use `--device-id`

**If: your controller has a static IP address**
- Use `--device-host`

**If: you only want to use Wifi, even if USB is connected**
- Use `--device-host` or `--discovery=wifi`

**If: you only want to use USB, even if Wifi is connected**
- Use `--discovery=usb`

## `--device-id`

Every Spark controller has a unique serial number that can be used as device ID.

If you set the `--device-id` argument, device discovery will skip any devices with a different ID. This goes for discovery in both USB, and Wifi.

Scroll down for instructions on how to find the device ID.

Example configuration with `--device-id` set:

```yaml
  spark-two:
    image: brewblox/brewblox-devcon-spark:rpi-${BREWBLOX_RELEASE:-stable}
    privileged: true
    restart: unless-stopped
    labels:
      - "traefik.port=5000"
      - "traefik.frontend.rule=PathPrefix: /spark-two"
    command: >
      --name=spark-two
      --mdns-port=${BREWBLOX_PORT_MDNS:-5000}
      --device-id=300045000851353532343835
```

## `--device-host`

If you enabled Wifi on the Spark, you can use the management page in your router to give it a fixed IP address. To find out how to do so, google "static dhcp lease" + the brand and model of your router.

After you have done so, you can tell the service to always connect to the same address by using the `--device-host` argument.

Example configuration with `--device-host` set:

```yaml
  spark-two:
    image: brewblox/brewblox-devcon-spark:rpi-${BREWBLOX_RELEASE:-stable}
    privileged: true
    restart: unless-stopped
    labels:
      - "traefik.port=5000"
      - "traefik.frontend.rule=PathPrefix: /spark-two"
    command: >
      --name=spark-two
      --mdns-port=${BREWBLOX_PORT_MDNS:-5000}
      --device-host=192.168.0.101
```

## `--discovery=wifi` / `--discovery=usb`

If you haven't used `--device-host` to set a fixed address, the Spark service will try to discover the Spark controller.

Controllers can be discovered both over USB, and over Wifi. By default, the service tries both: first USB, then Wifi.

You can restrict discovery by using the `--discovery` argument. This can be used in combination with `--device-id`.

Example configuration to only discover USB devices:

```yaml
  spark-two:
    image: brewblox/brewblox-devcon-spark:rpi-${BREWBLOX_RELEASE:-stable}
    privileged: true
    restart: unless-stopped
    labels:
      - "traefik.port=5000"
      - "traefik.frontend.rule=PathPrefix: /spark-two"
    command: >
      --name=spark-two
      --mdns-port=${BREWBLOX_PORT_MDNS:-5000}
      --discovery=usb
```

## Finding the device ID

There are multiple ways to get the controller device ID.

If your Spark controller is connected to Wifi, you can navigate to its IP address in your browser.

![Device ID result](../images/device-id-message.png)

If your Spark controller is connected over USB, you can get its device ID by running the following command in your terminal:

```bash
docker run --rm --privileged brewblox/brewblox-devcon-spark:rpi-edge --list-devices
```

Example output (SER is the device ID):

```bash
pi@brewpipi:~/brewblox $ docker run --privileged brewblox/brewblox-devcon-spark:rpi-edge --list-devices
2019/02/01 10:41:05 INFO     brewblox_service.service        Creating [spark] application
2019/02/01 10:41:05 INFO     __main__                        Listing connected devices: 
2019/02/01 10:41:05 INFO     __main__                        >> /dev/ttyACM0 | P1 - P1 Serial | USB VID:PID=2B04:C008 SER=300045000851353532343835 LOCATION=1-1.2:1.0
```

## Connection flowchart

The Spark service is able to automatically discover Spark controllers over both Wifi and USB.

Note that the order in which controllers are discovered is not guaranteed.
If you are using multiple Spark controllers, you will want to specify a device address or serial number.

The Spark service uses multiple arguments to determine how and where to find the Spark controller it should connect to.
These arguments are:
* `--device-serial`
* `--device-host`
* `--discovery`
* `--device-id`

The following diagram is a (simplified) display of the decision process to select a device.
If discovery fails, the service reboots. This is because of a limitation in how Docker handles USB devices: the service must be started after the device was plugged in.

<PlantUml src="connection_flow.puml" title="Selecting device address"/>

`--device-serial` and `--device-host` are the most specific arguments, and will take priority.
Note that device ID will not be checked when using these arguments.

Examples:
```yaml
  spark-one:
    ...
    command: >
      --device-host=192.168.0.60
```
```yaml
  spark-one:
    ...
    command: >
      --device-serial=/dev/ttyACM0
```

`--discovery` has three possible values: `all`, `usb`, or `wifi`. `all` is the default. <br>
Because USB devices are more specific, they will always be checked first.

`device-id` is used to disqualify discovered devices. If `--device-id` is not set, all discovered devices are valid.

The argument value is the unique device ID of your Spark controller. 

Specific device, over Wifi or USB:
```yaml
  spark-one:
    ...
    command: >
      --device-id=300045000851353532343835
```
Specific device, USB only:
```yaml
  spark-one:
    ...
    command: >
      --discovery=usb
      --device-id=300045000851353532343835
```
First discovered device, Wifi only:
```yaml
  spark-one:
    ...
    command: >
      --discovery=wifi
```
