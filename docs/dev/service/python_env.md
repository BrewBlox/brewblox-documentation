# Python development setup

Brewblox services are deployed in Docker containers with a specific version of Python.
This version matters: for ARM platforms (ie. Raspberry Pi),
we want to use prebuilt dependencies from <https://www.piwheels.org/>.
Piwheels supports the Python versions used by Raspberry Pi OS.

At the time of writing, this means **Python 3.7, 3.9, and 3.11**.

If your development machine uses a different Python version,
you'll need a way to use parallel Python installations.
For this, we use [Pyenv](https://github.com/pyenv/pyenv). \
To manage the dependencies and environment for specific projects,
we use [Poetry](https://python-poetry.org/).
Poetry installs a virtualenv using the Python version provided by Pyenv. \
Both Pyenv and Poetry offer detailed installation instructions on their websites.
We'll go through the short and simple version here.
This assumes you're using Debian, Ubuntu, or Linux Mint.
If you are using a different OS, please see the respective websites for appropriate instructions.

Python editors such as [Visual Studio Code](https://code.visualstudio.com/)
can often automatically identify and use the virtualenv that belongs to a project.
If it doesn't, please see the documentation for your IDE or editor.

## Install [Pyenv](https://github.com/pyenv/pyenv)

**This only has to be done once.**
If you're not sure whether you already have Pyenv installed, run `pyenv --version` to check.

```bash
sudo apt-get update -y

sudo apt-get install -y \
  make build-essential libssl-dev zlib1g-dev libbz2-dev \
  libreadline-dev libsqlite3-dev wget curl llvm libncurses5-dev libncursesw5-dev \
  xz-utils tk-dev libffi-dev liblzma-dev git python3-venv

curl https://pyenv.run | bash

echo 'export PYENV_ROOT="$HOME/.pyenv"' | tee -a ~/.bashrc ~/.profile

echo 'command -v pyenv >/dev/null || export PATH="$PYENV_ROOT/bin:$PATH"' | tee -a ~/.bashrc ~/.profile

echo 'eval "$(pyenv init -)"' | tee -a ~/.bashrc ~/.profile

exec $SHELL --login
```

## Install [Poetry](https://python-poetry.org/)

**This only has to be done once.**
If you're not sure whether you already have Poetry installed, run `poetry --version` to check.

```bash
curl -sSL https://install.python-poetry.org | python3 -

exec $SHELL --login
```

## Install Python

**This only has to be done once.**
If you're not sure whether you already have the desired Python version installed, run `pyenv versions` to check.

This will install a parallel Python version you can use for development.
It will not change the system version of Python.
We're using 3.11 here because it is the latest Python version supported by Piwheels.

```bash
pyenv update

pyenv install 3.11
```

## Setup project env

This will install a Python virtualenv with the project dependencies.
We have to tell Poetry what Python version it should use to create the virtualenv.
Afterwards, we can just use the virtualenv to get the correct version.

```bash
# IMPORTANT: Run these commands in the root directory of your project

pyenv shell 3.11

poetry env use 3.11

poetry install
```

## Checking the result

After we've done all this, or when resuming development on an older service,
we want to know if everything is set up as it should be.

```bash
# IMPORTANT: Run these commands in the root directory of your project

poetry shell

python3 --version
```

If this prints the correct Python version, then yay! - you're all set.

If it does not, you'll want to remove the virtualenv directory, and repeat the **Setup project env** step.
To get the virtualenv location, run:

```bash
# IMPORTANT: Run these commands in the root directory of your project

poetry shell

echo $VIRTUAL_ENV
```
