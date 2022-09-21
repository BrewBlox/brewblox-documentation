# Development platform

As a runtime service host, we recommend the Raspberry Pi as a minimum viable solution.

For software development and build purposes, the Pi is decidedly underpowered.
Docker builds on anything below a Pi4 4GB will be an excercise in patience.

We'll outline the possibilities and and limitations of various development platforms below.

## Linux

The native development platform for Brewblox services is the Ubuntu Linux distro.
This is what we ourselves use for development purposes, and what is consequently the most optimized alternative.

A common approach for those not using Linux as their daily OS is to [install Ubuntu alongside Windows](https://itsfoss.com/install-ubuntu-1404-dual-boot-mode-windows-8-81-uefi/).

## Mac

MacOS is based on Unix, and supports Docker. This makes it sort-of compatible with Brewblox.

Development dependencies for the [Brewblox boilerplate](https://github.com/BrewBlox/brewblox-boilerplate) (pyenv, poetry)
already are compatible with Mac.

The runtime installation is more complicated.
We're considering adding official support for the platform, but until then, you will need to make some manual adjustments to the `brewblox-ctl` `install` and `setup` shell commands.
This is very doable, but requires some expert knowledge of shell commands.

Another complication is that Docker for Mac [can't access USB devices](https://github.com/docker/for-mac/issues/900).
This is acceptable for some services, and a deal breaker for others.

## Virtual Machine (VM)

If the above options are not acceptable, then there's always the option of installing Linux inside a Virtual Machine, and using this.

Performance will typically be worse than the native alternatives,
but it has the advantage of keeping the development environment well-separated from everything else on your computer.

## Remote development IDE

Our favorite code editor, [VS Code](https://code.visualstudio.com/), offers the [Remote Development plugin](https://code.visualstudio.com/docs/remote/remote-overview).
This plugin lets you run the editor on your own machine, while editing code on another.
This enables effective use of two new platforms: WSL2, and later models of the Pi itself.

### Windows Subsystem for Linux 2 (WSL2)

With the introduction of [WSL2](https://ubuntu.com/wsl), Windows finally has decent support for Docker.
In simple terms, WSL2 lets you install Linux inside Windows. You can access the same files with both operating systems.

To install Brewblox, follow [the WSL install guide](https://docs.microsoft.com/en-us/windows/wsl/install-win10),
install [Docker Desktop for Windows](https://hub.docker.com/editions/community/docker-ce-desktop-windows/),
and then proceed as normal with the [Getting Started guide](../../user/startup.md).

The Remote Development plugin explicitly supports WSL2 as backend.

### Raspberry Pi

The Pi4 comes with a significantly faster CPU compared to its predecessors, and is available with 4 or 8GB RAM.
This makes it a valid (if not optimal) development platform.

To use it as backend for remote development, select the SSH option, and connect to the Pi.
