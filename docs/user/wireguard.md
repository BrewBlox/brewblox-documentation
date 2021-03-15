# Remote access

Secure password-protected remote access is something we'd like to implement sometime in the future, but we're not there yet.
In the meantime, a safe alternative is to install and use a Virtual Private Network (VPN).

This tutorial uses [Wireguard](https://www.wireguard.com/) because it's fast, and easy to set up on a Raspberry Pi.

::: tip
Synology users can follow [this guide](https://github.com/runfalk/synology-wireguard) for server installation.
:::

## What is a VPN?

When you visit a website (or the Brewblox UI), your browser sends multiple requests to the server.
This includes requests for current block values and graph data, but also requests for block changes.
For this to be safe, every single request must include some form of authentication to confirm it's really you sending the request.

A VPN creates a secure tunnel between your device and the server.
You now only have to send authentication once: when creating the tunnel.
All requests and responses are sent through this tunnel, and the server can trust all requests that come through the tunnel.

This tunnel can be used both for the Brewblox UI, and SSH terminals.

## Server installation

We need to install the software, create the [public and private encryption keys](https://ssd.eff.org/en/module/deep-dive-end-end-encryption-how-do-public-key-encryption-systems-work),
and create the configuration for our tunnel.

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

Example content of the last part of /etc/sysctl.conf:
```bash
###################################################################
# Magic system request Key
# 0=disable, 1=enable all, >1 bitmask of sysrq functions
# See https://www.kernel.org/doc/html/latest/admin-guide/sysrq.html
# for what other values do
#kernel.sysrq=438

net.ipv4.ip_forward=1
```

Now create the server keys:
```bash
wg genkey | sudo tee /etc/wireguard/private.key | wg pubkey | sudo tee /etc/wireguard/public.key
```

::: danger
Do not ever share your private key. For encryption to be secure, this key must remain secret.
:::

We need the keys for the next step. Let's show them in the terminal:
```bash
sudo cat /etc/wireguard/private.key
sudo cat /etc/wireguard/public.key
```

We also need to figure out which network interface we should be using.
A shortcut is to check which network interface gave us an IP address starting with `192.168`.
If your router uses different address ranges, you will have to adjust accordingly.

```bash
ifconfig | grep -B 1 192.168
```

Example output:
```
pi@manyberry:~$ ifconfig | grep -B 1 192.168
wlan0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.2.7  netmask 255.255.255.0  broadcast 192.168.2.255
```

In this example, we want to be using the **wlan0** network interface.

Now create the `wg0.conf` configuration file for your VPN tunnel:
```bash
sudo nano /etc/wireguard/wg0.conf
```

This opens nano again. In the editor, copy the following text, and then we'll make some changes:
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

::: tip
To hide nano and see the earlier output, press `ctrl-Z`.
To go back to nano, type `fg` and press Enter.
:::

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

Example output:
```
pi@manyberry:~$ sudo wg-quick up wg0
[#] ip link add wg0 type wireguard
[#] wg setconf wg0 /dev/fd/63
[#] ip -4 address add 10.0.0.1/32 dev wg0
[#] ip link set mtu 1420 up dev wg0
[#] iptables -A FORWARD -i wg0 -j ACCEPT; iptables -t nat -A POSTROUTING -o wlan0 -j MASQUERADE
```

We also want Wireguard to start when the Pi starts:
```bash
sudo systemctl enable wg-quick@wg0
```

Now reboot your Pi for the system changes to take effect:
```bash
sudo reboot
```

## Port forwarding

Wireguard is now installed, but is not yet accessible from the internet.
For that to happen, we need the router to forward incoming traffic on **port 51820/udp** to the Wireguard server (the Pi).

The configuration UI to do this is different for each brand and make of router, so we can't write a one-size-fits-all guide.
You may need to google "port forwarding [ROUTER BRAND NAME]".

## DNS setup

Your public IP address can change, and it's much easier to remember a name than a group of numbers.
You can buy your own domain name, or use a free one from services like [Duck DNS](https://www.duckdns.org).

For this tutorial, we'll assume Duck DNS is used, but it's just a matter of names.

## Verification

To verify that the port is open and used, we can use the [nmap](https://en.wikipedia.org/wiki/Nmap) tool.

On your Pi, run:
```bash
sudo apt update
sudo apt install -y nmap
```

First, we check the Wireguard status:
```bash
sudo wg show wg0
```

Example output:
```
pi@manyberry:~$ sudo wg show wg0
interface: wg0
  public key: <SERVER PUBLIC KEY>
  private key: (hidden)
  listening port: 51820
```

Now, let's try nmap:
```bash
sudo nmap -sU -p 51820 localhost
```

Example output:
```
pi@manyberry:~$ sudo nmap -sU -p 51820 localhost
Starting Nmap 7.80 ( https://nmap.org ) at 2021-03-15 14:48 UTC
Nmap scan report for localhost (127.0.0.1)
Host is up.

PORT      STATE         SERVICE
51820/udp open|filtered unknown

Nmap done: 1 IP address (1 host up) scanned in 2.18 seconds
```

This output means that port 51820 is open and used.

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
- You need to add a peer (the server).
- You need to set the peer address, endpoint, and public key.

The peer for the server is the client, and vice versa.
This means we need to configure both the server and the client to accept each other as peer.

On the client, generate your public key and private key, and copy the public key.

Earlier, we configured the server to have the **address** `10.0.0.1/32` (in /etc/wireguard/wg0.conf).
Set the client address to `10.0.0.2/32`.
If you add more clients, increment their client address (`10.0.0.3/32`, `10.0.0.4/32`, etc).

The **endpoint** for the server is the public address and port where the server can be reached.
If you are using DuckDNS, this will be `[NAME].duckdns.org:51820`.

The **public key** for the server was created earlier during installation.
To get it, connect to your Pi, and run:
```bash
sudo cat /etc/wireguard/public.key
```

Your client is now configured to connect to the server, but the server won't accept the client yet.
For this to happen, we need to edit the Wireguard configuration on the server.

First, copy the **client public key**. We'll need this when editing the server configuration.

Before editing the Wireguard config on the server, you must stop the active service.
If you don't do this, the changes to the configuration file will not be saved.
```bash
sudo wg-quick down wg0
```

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

Example configuration:
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

Now restart Wireguard on the server:
```bash
sudo wg-quick up wg0
```

To check configuration:
```bash
sudo wg show wg0
```

Example output:
```
interface: wg0
  public key: <SERVER PUBLIC KEY>
  private key: (hidden)
  listening port: 51820

peer: <CLIENT PUBLIC KEY>
  endpoint: xxx.xxx.xxx.xxx:xxxxx
  allowed ips: 10.0.0.2/32
```

Start the Wireguard interface on your client, and you're done.

## Using the VPN

After all this is installed, configured, and started, you can now visit the Brewblox UI at `10.0.0.1`,
even when not at home.
