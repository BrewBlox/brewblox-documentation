# Common Issues

This is an overview of common or recurring problems encountered in development, and their solution.

## Cryptography fails to build

The Python [cryptography](https://github.com/pyca/cryptography) package is very common dependency.
If your package does anything web-related, it probably has a cryptography dependency.
The Poetry build environment depends on it to download other dependencies.

Since 2021, cryptography has a build-time dependency on rust (the programming language).
Practically speaking, this means that your CI must download a prebuilt cryptography release.
We need binary releases for all supported architectures: AMD64, ARM64, and ARM32.
The official cryptography CI/CD pipeline builds the AMD64 and ARM64 versions.
We rely on [piwheels](https://www.piwheels.org/project/cryptography/) to build the ARM32 binary.

Sometimes the piwheels build fails. If your CI pipeline resolves the dependency to a version
that has not been built by piwheels, it will attempt to build the ARM32 binary from source.
This attempt will fail, as the CI environment does not have rust installed.
It will only be the ARM32 build that fails, as the AMD64 and ARM64 builds can fetch the binary from PyPi.

When this happens, the solution is to version pin both cryptography dependencies in `pyproject.toml`
to a version that has been built by piwheels.

First, check <https://www.piwheels.org/project/cryptography/> for the latest version that has a successful build.
We'll use `42.0.5` as an example.

Then, pin the poetry dependency to that version.

```sh
poetry add "cryptography@==42.0.5"
```

Then, edit `pyproject.toml` to pin the build system dependency.

```toml
[build-system]
requires = ["poetry-core>=1.0.0", "cryptography==42.0.5"]
build-backend = "poetry.core.masonry.api"
```

Later, you'll want to bump the pinned version, or unpin it again.
Using a very old release exposes you to malware vulnerabilities.
