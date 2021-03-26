# Remote access

It's nice to be able to check up on the status of your brew while away from home, or edit block settings.
Because this involves the internet, this must be done safely and securely - you don't want strangers in control of your brew.

When you visit a website (or the Brewblox UI), your browser sends multiple requests to the server.
This includes requests for current block values and graph data, but also requests for block changes.
For this to be safe, the server must be able to trust the client.
In a local network, this is simple: everyone on the network is trusted.

This is no longer true when connected to the internet.
Here, every single request must include some form of authentication to confirm that the sender can be trusted.

Secure password-protected remote access is something we'd like to implement sometime in the future, but we're not there yet.
In the meantime, a alternative for safely connecting to your Pi is to install and use a Virtual Private Network (VPN).

This tutorial uses the [Wireguard](https://www.wireguard.com/) software because it's fast, and easy to set up.

::: tip
This guide was written for Raspberry Pi OS or Ubuntu.

Synology users can follow [this guide](https://github.com/runfalk/synology-wireguard) for server installation.
:::

## What is a VPN?

A VPN creates a secure tunnel between a client (your phone) and the server (your Pi).
Where before you needed to send authentication for every request, you now only need to do so once: when creating the tunnel.
All data to and from the server goes through this tunnel, and can't read or edited by others.

This tunnel can be used both for the Brewblox UI, and SSH terminals.

## What must be installed?

To create a tunnel, we have to install Wireguard on both the **server** (the Pi running your Brewblox services), and the **client** (the computer or phone on which you want to view the UI).

For the client to talk to the server at all, we need to configure the **router** to forward network traffic to the server.

We'll set up **DNS** so the client can more easily find the IP address of your router.

## Public and private keys

The server and the client will encrypt and decrypt all traffic with public and private encryption keys.

If you encrypt a message using a private key, you can only decrypt it using the public key.
This also means that if you get a message that you can decrypt using a particular public key, it was encrypted using the matching private key.

During this guide, we will generate key pairs (public + private) for both the server and the client.
Private keys are always kept secret, but public keys will be exchanged: we give the server the client public key, and vice versa.

You can find a more in-depth explanation [here](https://ssd.eff.org/en/module/deep-dive-end-end-encryption-how-do-public-key-encryption-systems-work).

## Server installation

We need to install the software, create the public and private encryption keys,
and create the configuration for our tunnel.

Open a terminal on the server (your Pi), and we'll run some terminal commands.

Install Wireguard:
```bash
sudo apt update
sudo apt install -y wireguard
```

Edit sysctl settings:
```bash
sudo nano /etc/sysctl.conf
```

This command opens the `nano` text editor. Use the arrow keys to scroll to the bottom of the file, and add:
```
net.ipv4.ip_forward=1
```

Press ctrl-X to save and exit the file.

::: details Example content of the last part of /etc/sysctl.conf
```bash
###################################################################
# Magic system request Key
# 0=disable, 1=enable all, >1 bitmask of sysrq functions
# See https://www.kernel.org/doc/html/latest/admin-guide/sysrq.html
# for what other values do
#kernel.sysrq=438

net.ipv4.ip_forward=1
```
:::

Now create the server keys:
```bash
wg genkey | sudo tee /etc/wireguard/private.key | wg pubkey | sudo tee /etc/wireguard/public.key
```

We need the keys for a later step. Let's show them in the terminal:
```bash
sudo cat /etc/wireguard/private.key
sudo cat /etc/wireguard/public.key
```

The keys will both end with a `=`. This is part of the key.

::: details Example keys (DO NOT USE)
```
pi@raspberrypi:~$ cat /etc/wireguard/private.key
kH7w/QdU25Age8FKovZApgcZCozECOh8iYuGtMWWr24=

pi@raspberrypi:~$ cat /etc/wireguard/public.key
FfQebIE7hg2th8KgytSaZ4J9Ov1VIKBDL1pOrtsEZTY=
```
:::

We also need to figure out which network interface on the server is being used to handle traffic from the router.
The router assigned this device an IP address. Typically this starts with `192.168`.
We can check which network interface has an IP address that looks like this.

If your router uses different address ranges, you will have to adjust the command below.

```bash
ifconfig | grep -B 1 192.168
```

::: details Example output
```bash
pi@raspberrypi:~$ ifconfig | grep -B 1 192.168
wlan0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.2.7  netmask 255.255.255.0  broadcast 192.168.2.255
```

In this example, we want to be using the **wlan0** network interface.
:::

Now create the `wg0.conf` configuration file for your VPN tunnel:
```bash
sudo nano /etc/wireguard/wg0.conf
```

::: tip
To hide nano and see the earlier output, press `ctrl-Z`.
To go back to nano, type `fg` and press Enter.
:::

The previous command opened nano again. In the editor, copy the following text, and then we'll make some changes:
```
[Interface]
Address = 10.0.0.1/32
SaveConfig = true
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o wlan0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -t nat -D POSTROUTING -o wlan0 -j MASQUERADE
ListenPort = 51820
PrivateKey = <SERVER PRIVATE KEY>
```

- In the `PostUp` and `PostDown` lines, replace **wlan0** with your network interface.
- In the `PrivateKey` line, replace `<SERVER PRIVATE KEY>` with the output you got from the `sudo cat /etc/wireguard/private.key` command.

When done editing, press ctrl-X to save and exit.

We now have two files that contain secrets: `private.key`, and `wg0.conf`.
Only we should be able to read and write them.
```bash
sudo chmod 600 /etc/wireguard/{private.key,wg0.conf}
```

Now start wg0 to verify the configuration is OK:
```bash
sudo wg-quick up wg0
```

::: details Example output
```
pi@raspberrypi:~$ sudo wg-quick up wg0
[#] ip link add wg0 type wireguard
[#] wg setconf wg0 /dev/fd/63
[#] ip -4 address add 10.0.0.1/32 dev wg0
[#] ip link set mtu 1420 up dev wg0
[#] iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o wlan0 -j MASQUERADE
```
:::

We also want Wireguard to start when the server starts:
```bash
sudo systemctl enable wg-quick@wg0
```

Now reboot your server for the system changes to take effect:
```bash
sudo reboot
```

## Port forwarding

Wireguard is now installed, but is not yet accessible from the internet.
For that to happen, we need the router to forward incoming traffic on **port 51820/udp** to the server (the Pi).

The configuration UI to do this is different for each brand and make of router, so we can't write a one-size-fits-all guide.
You may need to google "port forwarding [ROUTER BRAND NAME]".

## DNS setup

Your public IP address can change, and it's much easier to remember a name than a group of numbers.
You can buy your own domain name, or use a free one from services like [Duck DNS](https://www.duckdns.org).

For this tutorial, we'll assume Duck DNS is used, but it's just a matter of names.
If you'd rather not use a DNS service, you can also find your public IP address using [WhatIsMyIP.com](https://www.whatismyip.com).

## Verification

To verify that the port is open and used, we can use the [nmap](https://en.wikipedia.org/wiki/Nmap) tool.

On your server, run:
```bash
sudo apt update
sudo apt install -y nmap
```

First, we check the Wireguard status:
```bash
sudo wg show wg0
```

::: details Example output
```
pi@raspberrypi:~$ sudo wg show wg0
interface: wg0
  public key: <SERVER PUBLIC KEY>
  private key: (hidden)
  listening port: 51820
```
:::

Now, let's try nmap:
```bash
sudo nmap -sU -p 51820 localhost
```

::: details Example output
```
pi@raspberrypi:~$ sudo nmap -sU -p 51820 localhost
Starting Nmap 7.80 ( https://nmap.org ) at 2021-03-15 14:48 UTC
Nmap scan report for localhost (127.0.0.1)
Host is up.

PORT      STATE         SERVICE
51820/udp open|filtered unknown

Nmap done: 1 IP address (1 host up) scanned in 2.18 seconds
```

This output means that port 51820 is open and used.
:::


Next, we want to check that the port is forwarded by the router:
```bash
sudo nmap -sU -p 51820 [EXTERNAL_IP_ADDRESS]
```

The final step is to check the domain name:
```bash
sudo nmap -sU -p 51820 [NAME].duckdns.org
```

All of these should show port 51820 as "open|filtered".

## Client installation

For us to actually use the VPN, we also need a client.
Wireguard is [available for Windows, Mac, Android, iOS, and many other systems](https://www.wireguard.com/install/).

The UI for the various clients will be different, but the basics remain the same:
- You need a public key and a private key.
- You need to set a client address.
- You need to add a peer.
- You need to set the peer address, endpoint, and public key.

The peer for the server is the client, and vice versa.
This means we need to configure both the server and the client to accept each other as peer.

On the client, generate your public key and private key, and copy the public key.

Earlier, set the **server address** to `10.0.0.1/32` (in /etc/wireguard/wg0.conf). <br>
Set the **client address** to `10.0.0.2/32`.
If you add more clients, increment their client address (`10.0.0.3/32`, `10.0.0.4/32`, etc).

The **endpoint** for the server is the public address and port where the server can be reached.
If you are using DuckDNS, this will be `[NAME].duckdns.org:51820`.

The server **public key** was created earlier during installation.
To get it, open a terminal on your server, and run:
```bash
sudo cat /etc/wireguard/public.key
```

You can set **allowed IPs** for the server to `0.0.0.0/0`. This functions as a wildcard: all IPs are fine.

Your client is now configured to connect to the server, but the server won't accept the client yet.
For this to happen, we need to edit the Wireguard configuration on the server.

First, copy the **client public key**. We'll need this when editing the server configuration.

Before editing the Wireguard config on the server, you must stop the active service.
If you don't do this, the changes to the configuration file will not be saved.
```bash
sudo wg-quick down wg0
```

::: details Example output
```
pi@raspberrypi:~$ sudo wg-quick down wg0
[#] wg showconf wg0
[#] ip link delete dev wg0
[#] iptables -D FORWARD -i wg0 -j ACCEPT; iptables -t nat -D POSTROUTING -o wlan0 -j MASQUERADE
```
:::

To edit the config:
```bash
sudo nano /etc/wireguard/wg0.conf
```

Below the existing configuration, add the following:
```
[Peer]
PublicKey = <CLIENT PUBLIC KEY>
AllowedIPs = 10.0.0.2/32
```

:::details Example configuration
```
[Interface]
Address = 10.0.0.1/32
SaveConfig = true
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -t nat -A POSTROUTING -o wlan0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -t nat -D POSTROUTING -o wlan0 -j MASQUERADE
ListenPort = 51820
PrivateKey = <SERVER PRIVATE KEY>

[Peer]
PublicKey = <CLIENT PUBLIC KEY>
AllowedIPs = 10.0.0.2/32
```
:::

Again, press Ctrl-X to exit nano.

Now restart Wireguard on the server:
```bash
sudo wg-quick up wg0
```

To check configuration:
```bash
sudo wg show wg0
```

::: details Example output
```
interface: wg0
  public key: <SERVER PUBLIC KEY>
  private key: (hidden)
  listening port: 51820

peer: <CLIENT PUBLIC KEY>
  endpoint: xxx.xxx.xxx.xxx:xxxxx
  allowed ips: 10.0.0.2/32
```
:::

Start the Wireguard interface on your client, and you're done.

## Using the VPN

After all this is installed, configured, and started, you can now visit the Brewblox UI at `10.0.0.1`,
even when not at home.
