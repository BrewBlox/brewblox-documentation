# Upcoming release notes

## Brewblox release 2022/??/??

**firmware release date: 2022-??-??**

**Changes:**

- (feature) Added the `brewblox-ctl esptool` command. This wraps `esptool.py`, and is a management tool for the ESP32 chips found in the Spark 4.
- (feature) Tilt services can now directly sync temperatures to *Temp Sensor (External)* blocks.
- (improve) `brewblox-ctl up` now ignores the `-d` option. It always calls `docker-compose up -d`.
- (improve) Removed the somewhat confusing `--force/-f` flag from `brewblox-ctl add-spark / add-tilt / add-node-red`. Commands now prompt to say they'll create/overwrite.
- (fix) Fixed graph sidepanel for the *Temp Sensor (External)* block widget.
- (improve) Added a confirmation dialog when closing the *Sequence* editor with unsaved changes.
- (feature) The Spark relations diagram and Builder parts now show a block status dot.
- (fix) Removed bugged folder creation functionality from the dashboard wizard.
- (fix) Builder flows now re-render when a soft start actuator is toggled.
- (feature) Reworked multiple Builder parts to have a more consistent layout.
- (improve) Editing Builder parts or PID input will now open a dialog for the (input) block itself, not the claiming block.
- (fix) The Spark 2/3 display now re-renders when the display temperature unit is changed.
- (improve) History now immediately writes received data to the database.
- (removed) The `--write-interval` for the history service is removed because all data is written immediately.
- (improve) The PID now more predictably opens its input block dialog.
