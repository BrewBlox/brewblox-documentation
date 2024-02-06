# OpenWrt Installation

[OpenWrt] is a specialized Linux-based Operating System for embedded devices such as routers.
Because it is a Linux platform that supports Docker, you can install Brewblox on it.

The minimum system requirements are comparable to a Pi 3:

- 1Ghz dual core CPU (ARM32, ARM64 or x86_64)
- 1GB RAM
- 32GB disk space

## Packages

To use Brewblox, we need to install Python3, Avahi, GCC, and the tools to add and edit users.

```sh
opkg install \
  avahi-utils \
  bash \
  coreutils-chmod \
  curl \
  gcc \
  procps-ng-ps \
  python3-dev \
  python3-psutil \
  python3-venv \
  shadow-groupadd \
  shadow-useradd \
  shadow-usermod \
  sudo
```

## Time zones

System time zones are mounted in Brewblox containers.
To do so on OpenWrt, we need to install the relevant system packages.

This depends on where you live. Replace 'zoneinfo-europe' and 'Europe/Amsterdam' as needed.
For reference, see <https://en.wikipedia.org/wiki/List_of_tz_database_time_zones>.

If you live in The Netherlands:

```sh
opkg install zoneinfo-europe
rm /etc/localtime
ln -s /usr/share/zoneinfo/Europe/Amsterdam /etc/localtime
```

...or if you live in eastern Australia:

```sh
opkg install zoneinfo-australia
rm /etc/localtime
ln -s /usr/share/zoneinfo/Australia/Adelaide /etc/localtime
```

## User

By default, OpenWrt only has the root user.
For Brewblox, we'd rather have a separate user with limited basic rights and sudo access.

The name doesn't matter.
As an example, we'll add the user `brew`.
You can use whatever you like, as long as you replace all instances of `brew`
in the code block below.

```sh
useradd -m -s /bin/bash brew
passwd brew
groupadd -r sudo
usermod -a -G sudo brew
usermod -a -G docker brew

echo '%sudo ALL=(ALL) ALL' >> /etc/sudoers.d/00-custom
echo 'PATH="$HOME/.local/bin:$PATH"' >> /home/brew/.profile
```

Restart the system to apply user rights.

## Installation

The preparation is now done.
Login with the user you added earlier, and run the Brewblox install script:

```sh
wget -qO - https://www.brewblox.com/install | bash
```

## Add network to LAN zone

TODO
