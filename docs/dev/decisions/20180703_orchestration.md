# Container Orchestration

Date: 2018/07/03

## Context

The natural result of having a system consisting of multiple Docker containers, is that you need to manage them.

Brewblox adds some additional complexity with the notion that every user has their own local deployment stack.
Any container orchestration tool used must be sufficiently simple for it to be operated by end users.

## Requirements

* Supports Docker containers
* Simple to use
* Works well on single-host servers
* Can interact with hardware devices (eg. USB, Bluetooth)
* Supported by GUI application(s) capable of:
  * First time setup
  * Monitoring system state
  * Updating the system
  * Changing the system configuration at runtime
* Supported by Raspberry Pi
* Free

## [Docker-Compose][docker-compose]

This has so far in the Brewblox project been the go-to choice for container orchestration. It is simple to install and configure.

While it works well when used by developers willing to SSH onto a server to rewrite a YAML file, it lacks a good GUI.

It also has been declining in popularity, compared to Docker Swarm and Kubernetes.

## [Docker Swarm][docker-swarm]

Docker Swarm is an alternative to docker-compose, and can even use the same configuration files (docker-compose.yml). It is integrated in Docker itself, making it a reliable choice.

A deal breaker is its lack of support for hardware devices. Docker swarm is built around the concept of hosts cooperating to serve a stack of services. In a multi-host environment, it is clearly a low priority to support interaction with hardware devices.

[A feature proposal][swarm-device-proposal] was submitted a day before this document was written. Even if the proposal is accepted and made a priority, it will be some time before it is released.

Current workarounds such as [container-in-container][device-workaround-1] or [podlike services][podlike] are rather hacky.

## [Kubernetes][kubernetes]

Kubernetes is becoming one of the more popular container management tools. There are tutorials for [hypriot][hypriot-kubernetes-tutorial] and [raspbian][raspbian-kubernetes-cluster] on how to set it up on Raspberry.

Major drawbacks are its complexity, and optimisation for multi-host systems.

## [Ansible][ansible]

```sh
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip
pip3 install ansible
```

Ansible is a task automation tool that can do much more than just managing docker containers.

While it is powerful, and likely very useful for power users, it is not simple to get started. It has an UI, but that is not free, and marketed at corporate users.

Users who already utilise Ansible can easily integrate Brewblox containers in their existing environment, but offering it as the default would only increase the barrier of entry for new users.

## Conclusion

None of the orchestration tools on offer are perfect for IoT applications on a single Raspberry Pi.

While it lacks a good GUI, and is declining in popularity, docker-compose is arguably the simplest and best suited option.

As soon as Docker Swarm supports devices, it might be beneficial to switch over.

[device-workaround-1]: https://github.com/docker/swarmkit/issues/1244#issuecomment-394343097
[device-workaround-2]: https://github.com/docker/swarmkit/issues/1244#issuecomment-285935430
[podlike]: https://blog.viktoradam.net/2018/05/14/podlike/
[swarm-device-proposal]: https://github.com/docker/swarmkit/issues/2682
[kubernetes]: https://kubernetes.io/
[hypriot-kubernetes-tutorial]: https://blog.hypriot.com/post/setup-kubernetes-raspberry-pi-cluster/
[raspbian-kubernetes-cluster]: https://kubecloud.io/setup-a-kubernetes-1-9-0-raspberry-pi-cluster-on-raspbian-using-kubeadm-f8b3b85bc2d1
[docker-compose]: https://docs.docker.com/compose/
[docker-swarm]: https://docs.docker.com/engine/swarm/
[ansible]: https://www.ansible.com/overview/how-ansible-works
