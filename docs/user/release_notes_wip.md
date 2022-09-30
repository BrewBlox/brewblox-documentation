# Upcoming release notes

## Brewblox release 2022/??/??

**firmware release date: 2022-??-??**

**Changes:**

- (feature) Added the `brewblox-ctl esptool` command. This wraps `esptool.py`, and is a management tool for the Spark 4.
- (feature) Tilt services can now directly push temperatures to *Temp Sensor (External)* blocks.
- (improve) `brewblox-ctl up` now ignores the `-d` option. It always calls `docker-compose up -d`.
- (improve) Removed the somewhat confusing `--force/-f` flag from `brewblox-ctl add-spark / add-tilt / add-node-red`. Commands now prompt to say they'll create/overwrite.
- (fix) Fixed graph sidepanel for the *Temp Sensor (External)* block widget.
