#!/usr/bin/env bash
set -e

# One-click web install script for Docker and BrewBlox
# If this script is hosted at eg https://brewblox.com/install
# You can run it with "curl -sSL https://brewblox.com/install | sh"
#
# - Docker will only be installed if it was not yet present
# - Current user will be added to the "docker" group
# - Docker-compose will be installed
# - A standard docker-compose.yml file matching the current architecture is installed in ./brewblox/
#

command_exists() {
    command -v "$@" > /dev/null 2>&1
}

prompt() {
    while true; do
        read -p "$1 [Y/n]" yn
        case "$yn" in
            "" ) ;&
            [Yy]* ) echo "yes"; break;;
            [Nn]* ) echo "no"; break;;
            * ) echo "Please answer yes or no.";;
        esac
    done
}

do_install() {
    echo "Executing BrewBlox install script..."

    if command_exists docker; then
        echo "Docker is already installed, skipping..."
    else
        curl -sSL https://get.docker.com | sh
        RESTART_NEEDED=true
    fi

    if id -nG "$USER" | grep -qw "docker"; then
        echo "$USER already belongs to the docker group, skipping..."
    else
        if [ $(prompt "Do you want to run Docker commands without sudo?") = yes ]; then
            sudo usermod -aG docker $USER
            RESTART_NEEDED=true
        fi
    fi

    sudo apt install -y git python python-pip
    pip install --user -U docker-compose

    mkdir brewblox/
    curl -L -o /tmp/zippy.zip https://github.com/brewblox/brewblox-deployment/archive/develop.zip
    unzip -q /tmp/zippy.zip -d /tmp/brewblox/
    cp -r /tmp/brewblox/*/$(dpkg --print-architecture)/* brewblox/
    rm /tmp/zippy.zip
    rm -r /tmp/brewblox

    echo
    echo "Installation finished."
    if [ "$RESTART_NEEDED" = true ] ; then
        echo "Please restart your system before use."
    fi
    echo
}

do_install
