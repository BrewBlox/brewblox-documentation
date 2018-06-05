# Releasing development versions

Date: 2018/05/22

## Context

After previous efforts, the BrewBlox CI automatically releases Python packages to PyPi, and Docker images to Docker Hub. Images are created both for the AMD64 and ARM32v7 architectures.

An issue is that this only happens for released versions. Developers wanting to test their new features or bugfixes using Docker containers must replicate the release process manually.

The ability to automatically release development versions would significantly help developers.

## Requirements

* The process mirrors the "real" release process
* The process can be started manually
* The process is automatically triggered
* Assigned versions do not conflict with "real" released versions
* Semantic versioning must be used
* No code changes required to trigger a develop release
    * Example: manually setting a version number
    * This carries a significant risk of accidentally committing these changes
* Users downloading "latest and greatest" must never get a development release
* Only contributors who can push to the brewblox repository may release software


## Versioning: Python

PyPi versions are determined by the `setup.py` script. If the `version` attribute in this file is hardcoded, dev releases would require code changes.

At the same time, PyPi [supports develop releases][dev_version_pep]. These are only considered when using the `--pre` flag in a `pip install` command.

A common scheme is to tag release commits in git, and set the develop version as "next version + commits since last release tag".

Example:

```
1.2.3          <== latest release
1.2.4.dev5     <== 5 commits since 1.2.3
```

The [setuptools_scm][setuptools_scm] Python library allows determining this value automatically.

The classic version number in `setup.py` would be replaced by running `setuptools_scm` implicitly.

```python
# old
setup(
    version='1.2.3',
    ...
)

# new
setup(
    use_scm_version={'local_scheme': lambda v: ''},
    setup_requires=['setuptools_scm'],
    ...
)
```

This approach allows us to release development versions to PyPi without them conflicting with release versions. They will also not be downloaded unless the user explicitly allows development versions.


## Versioning: Docker

Contrary to PyPi, Docker Hub allows re-uploading specific versions.

Keeping a history of development versions is not required, but multiple features should be able to release their own development version.

Tagging Docker images with the name of the feature branch meets these requirements: the image has no name conflict with release versions, and is unique for each feature. It also overwrites previous development releases for the feature, reducing clutter in Docker Hub.

Example version (tag):
```
brewblox/brewblox-devcon-spark:feature-implement-doodad
```

## Matching versions

When creating the Docker image, it must be associated with the correct Python package. We don't want to rely on uploading to PyPi, and immediately downloading that very last version, and also need to support release and development versions out of the box.

A solution is to perform the following steps:
* Build Python package (version determined by setuptools_scm)
* Copy the built package (zip file) into a specific directory (`/pkg/`) in the Docker image
* `pip install` everything in `/pkg/`. This automatically resolves the version issue - it will install the version we just copied, along with its dependencies.
* In case we somehow did not copy a Python package to the directory, install the Python package by name
    * By default, Pip will not upgrade if any version is already installed
    * If no package was copied to `/pkg/`, it will ensure -something- is installed in the image


## Trigger conditions

The current development flow (`automated_releases.md`) assumes that all contributors have their own fork, but allows larger feature branches to be pushed to the central repository.

An approach to automation is to release a develop version for every push to the central repository. Release versions are created when a new tag is pushed.

Using this approach, there also is a develop version for the `develop` branch.

This also ensures that PyPi / Docker Hub passwords are kept secure: the passwords are added as [secret environment variable][travis_secure_vars] to Travis. Contributors with push rights to the repository can trigger releases, but even they do not need to know the password.

## Concurrency bugs

After implementation of this scheme, a practical bug was uncovered.

To reproduce:

* Merge `develop` into `master`
* Travis automatically starts an on-push build, including the release of a develop version
* Create a new version tag, and push it to `master`
* Travis automatically starts an on-tag build, including the release of a release version
* The existing on-push Travis build picks up the new tag, and `setuptools_scm` assigns a release version to the package.
* Deployment in the on-tag build fails, because the version is already present in PyPi

This was fixed by updating the trigger condition rules: pushes to the `master` branch do not trigger any releases. The assumption is that any commit pushed to `master` already had a develop release on the `develop` branch.

## Manually releasing

In order to simplify the commands required to release a version, the `brewblox-tools` repository was created.

Example:

```bash
 # builds Python package
tox

# Copies Python package to Docker directories, so they can copy into image
bbt-distcopy .tox/dist/ docker/pkg/ rpi-docker/pkg/

# Create AMD Docker image, and push
bbt-deploy-docker -i docker/ -n brewblox/brewblox-devcon-spark -t feature-add-doodad

# Enable cross compiling
docker run --rm --privileged multiarch/qemu-user-static:register --reset

# Create ARM Docker image, and push
bbt-deploy-docker -i rpi-docker/ -n brewblox/brewblox-devcon-spark -t rpi-feature-add-doodad
```

It is not required for developers to know these commands by heart: they can copy them from the `.travis.yml` file.


## Conclusion

All requirements can be satisfied by a combination of deployment rules (expressed in `.travis.yml`), a `brewblox-tools` package, and a Python package for determining dev versions (`setuptools_scm`).


[setuptools_scm]: https://github.com/pypa/setuptools_scm
[dev_version_pep]: https://www.python.org/dev/peps/pep-0440/
[travis_secure_vars]: https://docs.travis-ci.com/user/environment-variables/#Defining-encrypted-variables-in-.travis.yml


## References

* https://github.com/pypa/setuptools_scm
* https://www.python.org/dev/peps/pep-0440/
* https://docs.travis-ci.com/user/environment-variables/#Defining-encrypted-variables-in-.travis.yml