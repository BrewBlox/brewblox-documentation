# Raspberry Deployment

Date: 2018/03/14

## Context

In order to deploy a modular set of applications to a target environment, we prefer to use Docker containers.

Many BrewPi customers will not be running Linux w/ Docker, or have the desire and technical know-how to install it.

A compromise is to support Raspberry Pi deployment. They are cheap, and can be easily installed.
If we provide a thin OS with our requirements pre-installed, customers can easily put this on an SD card, and run it on their Pi.

## Requirements

* Prebuilt image, or simple installation guide.
* Installation of the following containers on a Docker container inside a Raspberry
    * RabbitMQ
    * InfluxDB
    * traefic
    * Python3.6


## Installation

Since Raspbian Jessie Raspberry officially [supports][1] Docker.
This means we can use the default Raspbian image, along with the default [installation guide][2]

## Required steps

* Download Raspbian Lite image
* Write the image to an SD card using Etcher(Linux/Windows) or Rufus(Windows)
* Plug the SD card into the Raspberry
* Connect the Raspberry to SSH or a monitor/keyboard
* Log in on the Raspberry using SSH / monitor
* Update / upgrade system: `sudo apt update && sudo apt upgrade -y`
* Install Docker: `curl -sSL https://get.docker.com | sh`
* Install Python/Pip `sudo apt install -y python python-pip`
* Install Docker-compose `sudo pip install docker-compose`


[1]: https://www.raspberrypi.org/blog/docker-comes-to-raspberry-pi/
[2]: https://www.raspberrypi.org/documentation/installation/installing-images/README.md
