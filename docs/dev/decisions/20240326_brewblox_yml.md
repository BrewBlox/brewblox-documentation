# Brewblox.yml

Date: 2024/03/26

## Context

`brewblox-ctl` is the command-line tool that generates and manages Brewblox-related configuration.
We don't prevent users from manually editing configuration files,
but we do automatically overwrite some files every update.

brewblox-ctl itself also has persistent settings. So far they've been stored in the `.env` file,
and loaded as environment variables. This approach is simple, but limited.
The `.env` syntax does not support data types, validation, or nested fields.

Where needed (and possible), other configuration files have used settings from `.env`.
Of particular note are the Docker Compose files, that have built-in support for loading environment variables from `.env`.

Deployed configuration files are bundled with the brewblox-ctl package, and copied to their target directories.
This limits file-based configuration to a one-size-fits-all approach.

## Problems

Using environment variables in Python is verbose and error-prone.
You need to store the variable itself, but also keep a constant for the key name.
Any type and data validation must be done manually, as `os.getenv()` always returns a string.

The `.env` file has no native support for nested values or data types.

Static configuration files are awkward to customize before deployment,
and only `docker-compose.shared.yml` natively supports environment variable expansion.

## Solution

The general approach to a solution is two-fold:

- `brewblox-ctl` uses a dedicated configuration file.
- Deployed configuration files are customized based on settings in the new configuration file.

## Requirements

- The new configuration file MUST be user editable.
- The new configuration file MUST be editable using a generic text editor.
- The new configuration file SHOULD be easy to read and edit by end users.
- The new configuration file SHOULD be automatically generated.
- The new configuration file SHOULD NOT be automatically edited.
- Configuration data MUST be validated before use.
- Configuration data MUST be valid if the new configuration file is missing or empty.
- Available configuration options SHOULD be documented locally in the Brewblox installation.
- Generated configuration files SHOULD clearly indicate that they are automatically generated.

## Data format

As stated by the requirements, the new configuration file prioritizes readability and ease of use.
It must be editable in generic text editors, ruling out any kind of binary or compressed format.

This is a common use case, and the typical solutions include:

- ini
- toml
- json
- yaml
- lua
- python
- javascript

**Lua**, **Python**, and **Javascript** configuration files are most useful for conditional configuration.
Lua and Javascript require interpreters that are not guaranteed to be present.
All three are more suitable for power users declaring complicated configuration.
This is not our use case, and thus we will not be using them.

**ini** is essentially what we've been using so far: flat and untyped key/value syntax.
It is too crude to be suitable as a replacement.

**TOML**, **JSON**, and **YAML** all meet the requirements of being flexible but readable formats that
can be edited using a generic text editor.
YAML is a superset of JSON, optimized for ease of use in manually edited configuration files.
Any users more comfortable with JSON can still limit themselves to the JSON syntax when editing YAML files.

This means that the top two contenders are **TOML** and **YAML**.
Both are suitable formats, but YAML has an additional advantage.
We already have a user-editable YAML configuration file: `docker-compose.yml`.

Conclusion: we will be using **brewblox.yml** as our new configuration file.

## Data validation

Other Python-based Brewblox services use [Pydantic](https://docs.pydantic.dev/latest/) for data validation.
If it works, don't fix it. Pydantic meets our purposes well enough for use in `brewblox-ctl`,
and supports all Python versions supported by us (3.8 or higher).

## Generated configuration files

Configuration files come in a variety of formats and data types.
Initially, we will be generating YAML and env files, but this is likely to be extended later.

The base configuration (before customization) can be one of three things:

- static data in the `brewblox-ctl` Python code.
- configuration files loaded, parsed, and edited by `brewblox-ctl`.
- configuration template files, formatted using text-based variable expansion.

Our requirements include clearly indicating that generated files should not be manually edited.
This typically is done using a header comment.
The third option makes it both easier to support a variety of file formats,
and to include arbitrary comments.

The default approach to generating configuration files will be to include
[Jinja](https://jinja.palletsprojects.com/en/3.1.x/) template files in the `brewblox-ctl` package,
and render them using the configuration from `brewblox.yml`.

## Refreshing generated configuration

Configuration files are generated automatically during updates,
but can also require re-generation after changes to configuration in `brewblox.yml`.

We don't need to watch `brewblox.yml`. It would be overly aggressive to generate configuration immediately whenever the file is changed.
Applying the changes in `brewblox.yml` to the Brewblox system as a whole can and should be an explicit user action.

We'll add the `brewblox-ctl config apply` command for this.

## Documentation

Available configuration options should be documented locally in the Brewblox installation.
We can also include or extend documentation on <https://brewblox.com>, but this will only cover the latest version.

We can implement documentation either statically (as file, or as man page),
or dynamically (as `brewblox-ctl` command output).
The second is preferable, as we can then show both available fields, and current validation results.

We'll add the `brewblox-ctl config inspect` command.
It will show available fields, along with their default and current values.
