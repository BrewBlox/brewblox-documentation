# Analyzing log output

When receiving bug reports or support requests, the first question often is for the user to run `brewblox-ctl log`, and post the results.
The "result" is a link to https://termbin.com where the log output has been uploaded as text.
The log file includes system diagnostics, and logging for all active Brewblox Docker Compose services.

This log is first and foremost a debugging tool. It will have very little relevant info on a system that's working as intended,
and does not attempt to explain or provide context for technical terms and concepts.

Here, we'll go through its various components, and try to shed some light on why they are included, and how they can be used to find and fix problems.

We'll first look at the contents of a log file, and then highlight some patterns and messages that are particularly useful.

:::tip
Various Docker Compose commands are referenced throughout this document.
`docker-compose` is a Python application that is installed in a [virtualenv](https://docs.python.org/3/library/venv.html) with the other brewblox-ctl dependencies.

To enable `docker-compose` commands in your current shell, run:
```
source .venv/bin/activate
```
:::

## Basics

At its core, `brewblox-ctl log` is very simple. It collects system and service diagnostics, appends them to file, and then uploads the file to termbin.
The source code can be found [here](https://github.com/BrewBlox/brewblox-ctl/blob/edge/brewblox_ctl/commands/diagnostic.py).

While it's not foolproof, some care is taken to avoid leaking secrets or personal data, and the process for creating and uploading logs is intentionally transparent.

To see the shell commands used to generate the log, you can run `brewblox-ctl -v log`.

:::details Example
```sh
pi@manyberry:~/brewblox$ brewblox-ctl -v log
SHELL      docker version 2>&1
INFO       Log file: /home/pi/brewblox/brewblox.log
SHELL      echo "BREWBLOX DIAGNOSTIC DUMP" > brewblox.log
SHELL      date >> brewblox.log 2>&1
INFO       Writing Brewblox .env values...
SHELL      echo "\n++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ .env ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      echo "BREWBLOX_RELEASE=develop" >> brewblox.log 2>&1
SHELL      echo "BREWBLOX_CFG_VERSION=0.7.0" >> brewblox.log 2>&1
SHELL      echo "BREWBLOX_PORT_HTTP=80" >> brewblox.log 2>&1
SHELL      echo "BREWBLOX_PORT_HTTPS=443" >> brewblox.log 2>&1
SHELL      echo "BREWBLOX_PORT_MQTT=1883" >> brewblox.log 2>&1
SHELL      echo "COMPOSE_FILE=docker-compose.shared.yml:docker-compose.yml" >> brewblox.log 2>&1
SHELL      echo "COMPOSE_PROJECT_NAME=brewblox" >> brewblox.log 2>&1
INFO       Writing software version info...
SHELL      echo "\n++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Versions ++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      uname -a >> brewblox.log 2>&1
SHELL      python3 --version >> brewblox.log 2>&1
SHELL      docker --version >> brewblox.log 2>&1
SHELL      docker-compose --version >> brewblox.log 2>&1
INFO       Writing active containers...
SHELL      echo "\n+++++++++++++++++++++++++++++++++++++++++++++++++++++++ Containers +++++++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      docker-compose ps -a >> brewblox.log 2>&1
INFO       Writing grafana service logs...
SHELL      echo "\n++++++++++++++++++++++++++++++++++++++++++++++++++++ Service: grafana ++++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      docker-compose logs --timestamps --no-color --tail 200 grafana >> brewblox.log 2>&1
INFO       Writing node-red service logs...
SHELL      echo "\n++++++++++++++++++++++++++++++++++++++++++++++++++++ Service: node-red +++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      docker-compose logs --timestamps --no-color --tail 200 node-red >> brewblox.log 2>&1
INFO       Writing pi-temperature service logs...
SHELL      echo "\n+++++++++++++++++++++++++++++++++++++++++++++++++ Service: pi-temperature ++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      docker-compose logs --timestamps --no-color --tail 200 pi-temperature >> brewblox.log 2>&1
INFO       Writing spark-one service logs...
SHELL      echo "\n+++++++++++++++++++++++++++++++++++++++++++++++++++ Service: spark-one +++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      docker-compose logs --timestamps --no-color --tail 200 spark-one >> brewblox.log 2>&1
INFO       Writing spark-sim service logs...
SHELL      echo "\n+++++++++++++++++++++++++++++++++++++++++++++++++++ Service: spark-sim +++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      docker-compose logs --timestamps --no-color --tail 200 spark-sim >> brewblox.log 2>&1
INFO       Writing tilt service logs...
SHELL      echo "\n++++++++++++++++++++++++++++++++++++++++++++++++++++++ Service: tilt +++++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      docker-compose logs --timestamps --no-color --tail 200 tilt >> brewblox.log 2>&1
INFO       Writing filebrowser service logs...
SHELL      echo "\n++++++++++++++++++++++++++++++++++++++++++++++++++ Service: filebrowser ++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      docker-compose logs --timestamps --no-color --tail 200 filebrowser >> brewblox.log 2>&1
INFO       Writing eventbus service logs...
SHELL      echo "\n++++++++++++++++++++++++++++++++++++++++++++++++++++ Service: eventbus +++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      docker-compose logs --timestamps --no-color --tail 200 eventbus >> brewblox.log 2>&1
INFO       Writing victoria service logs...
SHELL      echo "\n++++++++++++++++++++++++++++++++++++++++++++++++++++ Service: victoria +++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      docker-compose logs --timestamps --no-color --tail 200 victoria >> brewblox.log 2>&1
INFO       Writing redis service logs...
SHELL      echo "\n+++++++++++++++++++++++++++++++++++++++++++++++++++++ Service: redis +++++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      docker-compose logs --timestamps --no-color --tail 200 redis >> brewblox.log 2>&1
INFO       Writing history service logs...
SHELL      echo "\n++++++++++++++++++++++++++++++++++++++++++++++++++++ Service: history ++++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      docker-compose logs --timestamps --no-color --tail 200 history >> brewblox.log 2>&1
INFO       Writing traefik service logs...
SHELL      echo "\n++++++++++++++++++++++++++++++++++++++++++++++++++++ Service: traefik ++++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      docker-compose logs --timestamps --no-color --tail 200 traefik >> brewblox.log 2>&1
INFO       Writing ui service logs...
SHELL      echo "\n+++++++++++++++++++++++++++++++++++++++++++++++++++++++ Service: ui ++++++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      docker-compose logs --timestamps --no-color --tail 200 ui >> brewblox.log 2>&1
INFO       Writing docker-compose configuration...
SHELL      echo "\n+++++++++++++++++++++++++++++++++++++++++++++++++++ docker-compose.yml +++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      cat docker-compose.yml >> brewblox.log 2>&1
SHELL      echo "\n++++++++++++++++++++++++++++++++++++++++++++++++ docker-compose.shared.yml +++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      cat docker-compose.shared.yml >> brewblox.log 2>&1
INFO       Writing spark-one blocks...
SHELL      echo "\n++++++++++++++++++++++++++++++++++++++++++++++++++++ Blocks: spark-one +++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      python3 -m brewblox_ctl http post --pretty https://localhost:443/spark-one/blocks/all/read >> brewblox.log 2>&1
INFO       Writing spark-sim blocks...
SHELL      echo "\n++++++++++++++++++++++++++++++++++++++++++++++++++++ Blocks: spark-sim +++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      python3 -m brewblox_ctl http post --pretty https://localhost:443/spark-sim/blocks/all/read >> brewblox.log 2>&1
INFO       Writing system diagnostics...
SHELL      echo "\n+++++++++++++++++++++++++++++++++++++++++++++++++++++++ docker info ++++++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      docker info >> brewblox.log 2>&1
SHELL      echo "\n+++++++++++++++++++++++++++++++++++++++++++++++++++++++ disk usage +++++++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      df -hl >> brewblox.log 2>&1
SHELL      echo "\n++++++++++++++++++++++++++++++++++++++++++++++++++++++ /proc/net/dev +++++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      column -t /proc/net/dev >> brewblox.log 2>&1
SHELL      echo "\n+++++++++++++++++++++++++++++++++++++++++++++++++++++ /var/log/syslog ++++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      sudo tail -n 500 /var/log/syslog >> brewblox.log 2>&1
SHELL      echo "\n++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ dmesg +++++++++++++++++++++++++++++++++++++++++++++++++++++++++\n" >> brewblox.log 2>&1
SHELL      dmesg -T >> brewblox.log 2>&1
INFO       Uploading brewblox.log to termbin.com:9999...

```
:::

## Contents

Log files are composed from multiple sources, and each section is preceded by a header to make it easier to find any specific section:
```
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++ .env ++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

BREWBLOX_RELEASE=edge
BREWBLOX_CFG_VERSION=0.7.0
BREWBLOX_PORT_HTTP=80
BREWBLOX_PORT_HTTPS=443
BREWBLOX_PORT_MQTT=1883
COMPOSE_FILE=docker-compose.shared.yml:docker-compose.yml
COMPOSE_PROJECT_NAME=brewblox

++++++++++++++++++++++++++++++++++++++++++++++++++++++++ Versions ++++++++++++++++++++++++++++++++++++++++++++++++++++++++

Linux raspberrypi 5.10.63-v7l+ #1488 SMP Thu Nov 18 16:15:28 GMT 2021 armv7l GNU/Linux
Python 3.9.2
Docker version 20.10.12, build e91ed57
docker-compose version 1.29.2, build unknown

...
```

Based on our own experiences reading logs, and known issues, we add or remove sections with some regularity.
Right now, included sections are:
- Selected `brewblox/.env` values (this only includes known safe keys).
- Version information for the OS, python, Docker, and Docker Compose.
- A list of active Docker Compose services.
- The last 200 lines of logging for every service listed in `brewblox/docker-compose.yml` and `brewblox/docker-compose.shared.yml`.
- `brewblox/docker-compose.yml`
- `brewblox/docker-compose.shared.yml`
- Block data for each Spark service present in `brewblox/docker-compose.yml`.
- Disk usage stats.
- systemd logs for docker.
- systemd logs for avahi-daemon.
- The last 500 lines of `/var/log/syslog`.
- dmesg

Not every section is relevant for every problem, and the commands run by `brewblox-ctl log` can also be run locally.
If you're trying to fix a specific problem, it's often more efficient to run the relevant individual commands.

## Service logs

The service logs sections of the log consists of running `docker-compose logs {service}` for each service defined in the compose files.

Services are a mixture of BrewPi-made (spark, history, tilt, plaato, hass) and third-party applications (eventbus, redis, traefik, victoria, ui).
For most problems, the Spark service logs are the most relevant, and the third-party service logs the least.

For local debugging, the `--follow` argument is very useful, as it provides a live view of the service logs. Example:
```
docker-compose logs --follow spark-one
```

## System logs

System log sections consist of the output of generic Linux logging mechanisms: journalctl, /var/log/syslog, and dmesg.

The journalctl entries contain the logs for specific system services: the Avahi (used for mDNS device discovery) and Docker daemons.
/var/log/syslog is a more generic system log mechanism, and dmesg contains low-level kernel messages.

A comprehensive overview of these tools is out of scope for this document, but as they are common to Linux, you can easily find more information on them.

For most systems, `sudo journalctl` is equivalent to /var/log/syslog, and `sudo journalctl -k` shows `dmesg` logs.

## Patterns and tips

Using logs for debugging mostly involves finding the one or two messages out of thousands that are relevant to the problem.
Even if useful for other problems, the vast majority of log messages is just noise.

Here, we'll highlight some of the messages that are particularly useful.
Some of them contain useful system information, and some of them serve as red flags that point out problems.

This list is far from complete, and can only suggest where to look.

**dmesg: Under-voltage detected**
```
Dec  6 10:31:57 raspberrypi kernel: [ 1069.039566] Under-voltage detected! (0x00050005)
```

Under-voltage is a very common source of weird and seemingly unrelated problems on the Pi.
Many phone chargers do not deliver enough power, even though they have the correct USB-micro / USB-C plug.
To fix it, make sure the power supply to your Pi [meets the recommended specs](https://www.raspberrypi.com/documentation/computers/raspberry-pi.html#typical-power-requirements).

**Spark service: service synchronized!**
```
spark-one_1  | 2022-01-02T21:15:19.590853907Z 2022/01/02 21:15:19 INFO     ...evcon_spark.synchronization  Service synchronized!
```

The connection between the Spark service and Spark controller goes through multiple steps before it is fully operational:
- disconnected
- connected (TCP/USB connection established)
- acknowledged (the device on the other end uses the right communication protocol)
- synchronized (the device has a matching ID, and uses compatible firmware)

The "service synchronized!" message is the final green light, and a useful target for ctrl-F searches.

**Spark service: handshake**
```
spark-one_1  | 2022-01-02T21:15:17.082854701Z 2022/01/02 21:15:17 INFO     ...lox_devcon_spark.connection  HandshakeMessage(name='BREWBLOX', firmware_version='3b77d006', proto_version='5b7a2e3b', firmware_date='2021-11-29', proto_date='2021-10-01', system_version='4.4.0', platform='esp32', reset_reason_hex='00', reset_data_hex='00', device_id='C4DD5766BB24', reset_reason='NONE', reset_data='NOT_SPECIFIED')
```

To verify that the controller uses compatible firmware, a plaintext handshake message is sent (and logged).
This message contains the various firmware versions for the controller.
The matching (desired) version information for the service can be found at the very start of the service logs:

```
spark-one_1   | 2022-01-02T21:28:48.244875895Z 2022/01/02 21:28:48 INFO     __main__                        firmware.ini: {'firmware_version': '3b77d006', 'firmware_date': '2021-11-29', 'firmware_sha': '3b77d00668d495e9083e6ba865e30318c64b09cb', 'proto_version': '5b7a2e3b', 'proto_date': '2021-10-01', 'system_version': '3.1.0'}
```

**Spark service: ValueError(Unexpected message)**
```
aquabrew_1   | 2022-01-02T22:11:05.718312578Z 2022/01/02 22:11:05 ERROR    ...blox_devcon_spark.commander  Error parsing message `180205C1|0000,010080FEFF81C4,[...]` : ValueError(Unexpected message)
```

The service only expects responses to requests it has sent.
Unexpected messages can be one of two things:
- The controller had a hangup longer than the timeout for a previous command.
- Multiple services are connected to the same controller.

In the first scenario, you'll typically find a command timeout error just above this message.
The alternative can be verified by checking the service connection settings in `docker-compose.yml`.

**dmesg: ADDRCONF(NETDEV_CHANGE)**
```
[Sat Jan  1 16:22:55 2022] IPv6: ADDRCONF(NETDEV_CHANGE): veth37a8442: link becomes ready
[Sat Jan  1 16:22:55 2022] IPv6: ADDRCONF(NETDEV_CHANGE): vetha8cc9b3: link becomes ready
[Sat Jan  1 16:22:55 2022] br-cbd412a18185: port 1(vetha8cc9b3) entered blocking state
[Sat Jan  1 16:22:55 2022] br-cbd412a18185: port 1(vetha8cc9b3) entered forwarding state
[Sat Jan  1 16:22:55 2022] IPv6: ADDRCONF(NETDEV_CHANGE): br-cbd412a18185: link becomes ready
```

This is logged on systems with IPv6 support whenever a container starts.
There is a longstanding bug in Docker where other containers restart whenever one changes its IPv6 interface state.

Excessive amounts of these messages indicates IPv6-related problems.

