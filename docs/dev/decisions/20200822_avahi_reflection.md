# Avahi mDNS reflection

Date: 2020/08/22

## Context

The Spark controller advertises itself over mDNS as a `_brewblox._tcp.local.` service.
Broadcasting is done by sending mDNS packets to the network interface,
where it will be received by all hosts connected to that network.

The problem for Brewblox is that the Spark service is not connected to the host network interface,
but to a docker bridge network.

Previously, the solution was to create a separate `mdns` service that used the `network_mode: host` setting.
The Spark service sent a HTTP request to the mdns service, and the mdns service checked host network interfaces for mDNS services with the correct type.

There are two major drawbacks to this approach:

- The mDNS service has to use a host port for its REST API.
- Every additional service is another point of failure for a distributed system.

## mDNS

Multicast Domain Name System (mDNS) is a protocol that uses multicast UDP packets to implement DNS without a dedicated name server.

It falls under the umbrella of zero-configuration network protocols (zeroconf).

There are multiple software implementations of the protocol:

- The majority of Linux distros come with the [Avahi daemon](https://www.avahi.org/) pre-installed.
- Apple has its own [Bonjour](https://en.wikipedia.org/wiki/Bonjour_(software)) implementation, that can also be installed on Windows.
- Windows 10 is making steps to implement mDNS / DNS-SD (an alternative / overlapping protocol).

Since Brewblox is primarily Linux-based, we'll assume Avahi to be the default mDNS implementation.

## Avahi reflection

From the [avahi-daemon man page](https://linux.die.net/man/5/avahi-daemon.conf):

> ### Section [reflector]
>
> **enable-reflector=** Takes a boolean value ("yes" or "no").
> If set to "yes" avahi-daemon will reflect incoming mDNS requests to all local network interfaces,
> effectively allowing clients to browse mDNS/DNS-SD services on all networks connected to the gateway.
> The gateway is somewhat intelligent and should work with all kinds of mDNS traffic,
> though some functionality is lost (specifically the unicast reply bit, which is used rarely anyway).
> Make sure to not run multiple reflectors between the same networks,
> this might cause them to play Ping Pong with mDNS packets.
> Defaults to "no".

"All local network interfaces" includes Docker bridge networks,
making this a very relevant setting.

By having an avahi-daemon process with `enable-reflector=yes`,
we can eliminate the need for the separate `mdns` service.

## Configuration considerations

Brewblox aims to have a very light permanent footprint.
This includes changes to configuration files on the host.

An alternative implementation is to bundle our own avahi-daemon,
and run it in a container with `network_mode: host`.
The problem is that we'd then have multiple daemons on the same host.

As the man page warns, having multiple daemons with reflection enabled
can cause mDNS overload caused by mirrored reflection.

If no mDNS implementation is running, then our mDNS client will not discover anything,
but not raise an error either.
In this scenario, "too little" is better than "too much".

We do want to make the configuration change optional.
This can be achieved by adding explicit `--no-change` flags to setup/update commands,
but also by considering that the setting is absent by default in the avahi-daemon.conf file.

The change can be implemented to use opt-out logic by not updating the avahi-daemon.conf file if any value is set for the `enable-reflection` setting.

We also want to gracefully degrade functionality if Avahi is not present on the host.
This can be done simply by not raising an error if the configuration file is not found.

## mDNS client code

Service discovery is currently initiated by the Spark service,
and brewblox-ctl.
The latter runs a service discovery during the `add-spark` and `discover-spark` commands.

The client (not counting the REST API) consists of an mDNS library ([aiozeroconf](https://github.com/frawau/aiozeroconf) or [zeroconf](https://github.com/jstasiak/python-zeroconf)),
and <100 lines of code.

`brewblox-devcon-spark` uses asyncio, and `brewblox-ctl` doesn't.
This prevents them from sharing implementation code and libraries.

As `brewblox-devcon-spark` is the only asyncio mDNS client,
it's not yet worth it to move the asyncio implementation upstream to `brewblox-service`.

## Changes

- Edit the /etc/avahi/avahi-daemon.conf file to set `enable-reflection=yes` if no previous value was set.
- Make the config edit part of `brewblox-ctl setup` and `brewblox-ctl update`.
- Move asyncio mDNS client code from the `mdns` service to `brewblox-devcon-spark`.
- Add synchronous mDNS client code to `brewblox-ctl-lib`.
- Remove the `mdns` service.
