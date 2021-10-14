# Upgrading to Python 3.9

Date: 2021/09/29

## Context

As time moves on, new Python versions are released, and old ones become obsolete.
While the use of containers lets us upgrade with very little fuss,
there are some secondary considerations.

We have to download or build wheels for AMD64, ARM32, and ARM64.
If no pre-built wheels are available, this may significantly increase build times.

We use [piwheels](https://www.piwheels.org/) for pre-built ARM32 packages.
This means we prefer to use Python versions supported by piwheels.
Until now, this meant Python 3.7 (the system version for Debian Buster).
With the release of Debian Bullseye, [piwheels added support for Python 3.9](https://blog.piwheels.org/python-3-9-wheels-for-bullseye/).

## Process

To upgrade a Brewblox service based on the boilerplate configuration,
these changes should be made:

- Install the new Python version for use in pyenv: `pyenv install 3.9.7`
- Remove the `.venv` directory in your directory: `rm -rf .venv`
- Update the project python version: `echo '3.9.7' > .python-version`
- Edit `pyproject.toml`, and set the python dependency to `python = ">=3.9,<4"`
- Edit `azure-pipelines.yml`, and change the `UsePythonVersion@0` task to use `versionSpec: '3.9'`
- Reinstall packages: `poetry install`
- Update packages: `poetry update`

Python 3.8 and 3.9 introduced some useful new features and syntax. You can find changelogs at:
- https://docs.python.org/3/whatsnew/3.8.html
- https://docs.python.org/3/whatsnew/3.9.html
