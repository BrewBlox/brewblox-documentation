# Unifying brewblox-ctl

Date: 2021/11/01

## Context and history

The Brewblox technology stack is containerized as much as possible,
but still requires initial configuration and server-side commands to install, start, stop, and update.

The `brewblox-ctl` CLI tool wraps much of the complexity and details involved.
As it runs on the host, it does not itself benefit from the isolation provided by containerization.
For this reason, brewblox-ctl is written in Python, and is kept compatible with all supported versions of Python 3.

Because Brewblox has multiple parallel release tracks (*edge* and *develop* being the most common),
semantic versioning is somewhat problematic.
To deal with this, brewblox-ctl was split in two parts: the generic *brewblox-ctl* distributed as a Python package with semantic versioning,
and the more specific command library *brewblox-ctl-lib* distributed using Docker images tagged with the relevant release track.

When installing or updating *edge* Brewblox, brewblox-ctl would pull the `brewblox-ctl-lib:edge` Docker image, and copy the Python source code in it to the *brewblox_ctl_lib/* directory.

## Drawbacks

The described process came with multiple drawbacks:
- The architecture was very unusual, and thus less maintainable.
- *brewblox-ctl* had to be compatible with multiple versions of *brewblox-ctl-lib*.
- Docker had to be installed on the host before *brewblox-ctl-lib* could be installed.
- On Synology systems, Pip had to be installed manually before Brewblox could be installed.
- *brewblox-ctl* and all its Python dependencies were installed on the host, in contravention to the Brewblox design goal of keeping everything local.

## Reshuffling components

With the introduction of the ESP32-based Spark 4, we started hosting firmware on Azure file storage.
Given the availability (and affordability) of dedicated file storage,
we decided to use it to resolve the bootstrap problem caused by hosting *brewblox-ctl-lib* as Docker image.

This change could be snowballed into resolving most of the drawbacks involved with the previous Brewblox/*brewblox-ctl* installation process.

If we had a file hosting platform that supports moving tags (develop/edge/etc), and allows for downloading files with wget/curl,
then we could exclusively use this, and skip the Pip installation.

If we no longer needed the Pip repository for fresh installs, then there was no reason to separate *brewblox-ctl* and *brewblox-ctl-lib*.

*brewblox-ctl* must be compatible with multiple Brewblox installs on the same host.
If we merge the two separate components, then everything must be installed in the Brewblox directory.
This is a common enough pattern in Python: virtualenv creation is part of the Python standard library.

Virtualenv creation somewhat complicates the initial installation steps before `brewblox-ctl install` is called.
This can be handled by providing an installer script that can be piped through bash.

## Bootstrap installation

After the deployment shuffle described above, a fresh install has to go through the following steps:

- Update system packages.
- Reboot to apply kernel changes from updated system packages.
- Download and run bootstrap installation script, which...
  - Downloads system packages.
  - Creates Brewblox install directory.
  - Creates virtualenv in install directory.
  - Downloads brewblox-ctl, and installs it in the virtualenv.
  - Activates the virtualenv.
  - Calls `brewblox-ctl install`, which...
    - Installs system package dependencies.
    - Installs Docker.
    - Makes any required changes to host configuration.
    - Creates directories that will be mounted in containers.
    - Creates configuration files:
      - `.env`
      - `docker-compose.yml`
      - `docker-compose.shared.yml`
      - `traefik/traefik-cert.yaml`
      - `traefik/brewblox.crt` (SSR cert file)
      - `traefik/brewblox.key` (SSR private key)
    - Pulls Docker images.

For the user, this is three steps. Everything cascades down from there.

## Entrypoint script

With this change, *brewblox-ctl* is no longer installed as package on the host, and the entrypoint is not be added to `~/.local/bin/`.
We still want the `brewblox-ctl` command to be available in a directory that's in `$PATH`, but it also has to be compatible with multiple parallel installations.

The solution is to add a very thin shell script called `brewblox-ctl` to the `~/.local/bin/` directory that:
- Checks if cwd is a Brewblox directory.
- Installs brewblox-ctl in a virtualenv if cwd is a Brewblox directory without brewblox-ctl.
- Activates the virtualenv.
- Calls `python3 -m brewblox_ctl` with the script arguments.

The thinness makes it compatible with all versions of *brewblox-ctl* that are installed in a virtual env, and deployed using Azure file storage.

## Handling upgrades

To smoothly handle upgrades from the old version to the new paradigm,
a final version of *brewblox-ctl-lib* is released.

Normally, *brewblox-ctl-lib* already downloads the latest version and then calls itself to resume the update with the latest and greatest source code.
Now, the latest and greatest version of *brewblox-ctl-lib* creates a virtualenv, installs the new version of *brewblox-ctl*, and then calls that to resume the update process again.

To perform a modicum of system cleanup, the files from the *brewblox_ctl* package are removed from the host site-packages directory.
Dependencies are not removed, as we can't be certain that *brewblox-ctl* was the only dependent.
