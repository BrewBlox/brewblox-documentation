# Brewblox release notes

Relevant links:

- User guides: <https://brewblox.netlify.app/>
- Discord server: <https://discord.gg/WaFYD2jaaT>
- Previous release notes: <https://brewblox.netlify.app/user/release_notes.html>
- Project board: <https://github.com/orgs/Brewblox/projects/1>
- Code repositories: <https://github.com/Brewblox>

## Brewblox release 2022/08/??

**firmware release date: 2022-08-??**

**IMPORTANT: This update must be flashed over USB for all controllers**

### Firmware nuts and bolts

Firmware development was becoming a bottleneck for new features.
To resolve this, Bob picked up firmware work in addition to UI and services,
and we have thoroughly re-organized and cleaned up the firmware code repository.

Many of the implemented changes are under the hood, but they made it possible to introduce new blocks and more efficient API calls.
The *Sequence* block implements much-improved support for mashing schedules and pre-defined recipes.
The *Temp Sensor (External)* block helps with value synchronization. It's now much easier to use a Tilt sensor as Spark input.

With the new soft start settings, the firmware now reduces inrush current peaks when using pumps.
This change required significant changes to how sub-second PWM is handled,
and we created the new *Fast PWM* block to handle 80-2000 Hz periods.

For those interacting with the Spark service block API directly, we have introduced the concept of firmware `patch` calls.
When making a patch call, all fields not explicitly present in argument data will be left unchanged.

### Fast PWM block

Previously, if a `period` value of < 1s was set in the *PWM* block, it would automatically jump to the 100Hz fast PWM implementation.
With the implementation of new fast PWM settings, this approach became too unwieldy.

PWM with periods of >1s are still handled by the existing *PWM* block,
but all <1s PWM is now done by the new *Fast PWM* block.
The *Fast PWM* block directly targets an IO channel (Spark 2 Pins, Spark 3 Pins, OneWire GPIO Module),
and supports 80, 100, 200, and 2000 Hz frequencies.

*Fast PWM* blocks differ from *PWM* blocks in that they target an IO channel directly, and not a Digital Actuator.
Digital constraints (Mutex, Min ON, min OFF) are not supported.

**If you have an existing PWM block with a 100Hz period, you will need to replace it with a Fast PWM block**

### Soft start inrush protection

*Digital actuator* blocks can now be configured to soft start. When switched on, they will briefly use fast PWM to ramp up.
This prevents inrush current peaks that can trigger the overcurrent protection mechanism in the OneWire GPIO module.

### Sequence block

With the abandonment of the [Automation Service](https://brewblox.com/user/services/automation.html)
we identified [desired features that we'd want to implement in some other way](https://brewblox.com/dev/decisions/20211123_automation_replacements.html).
Primary among this was firmware support for mash steps.

The most basic implementation would look like:

- Set setpoint setting
- Wait until setpoint setting is reached
- Wait for X seconds/minutes/hours

With the new *Sequence* block, we've added this, and more.
You can use this block to define instructions that are executed in sequence.
Instructions can **set** block settings, **wait** for conditions to be met, or **start** other profiles or sequences.

For a complete overview of available instructions, see [the reference page](https://brewblox.com/dev/reference/sequence_instructions.html).

### Temp Sensor (External) block

To improve support for third-party temperature sensors such as the Tilt,
we added a block that makes it easy and safe to work with external values that are written through the block API.

Simply put: it is a manually updated temperature sensor with a timeout.
If the external source of temperature values stops sending updates, the sensor will become invalid.

Example temperature update:

```sh
curl -sSk \
  -X POST \
  -H 'content-type: application/json' \
  -d '{
    "id": "tilt-sensor",
    "type": "TempSensorExternal",
    "data": { "setting[degC]": 25.6 }
  }' \
  https://brewblox-pi/spark-one/blocks/patch
```

### UI sidebar folders

The UI sidebar now shows a collapsible tree structure with links to available pages (dashboards, builder layouts, and services).
New folders can be added to the tree, and folders can contain any desired combination of folders and pages.
This way, pages can be grouped by logical relation (eg. the dashboards and builder layouts for Fermentation Tank 2).

By default, all pages are placed in the default *Dashboards*, *Layouts*, and *Services* folders.
If the folder containing a page is removed, the page is moved back to the default folder.

To prevent unintuitive behavior, previously defined custom ordering of sidebar items is ignored,
and all folders and pages are sorted alphabetically.

### Block claims

Previously, the UI showed indicators that block X was driven by block Y. Manual settings would be disabled on block X.
There were some inconsistencies and unintuitive corner cases in this system.
(Does a disabled block still drive its output? To what setting does a Setpoint revert when a Setpoint Profile is done?)

To make the system more predictable and robust, we introduced explicit claims.

- *Setpoint Driver* and *Setpoint Profile* blocks will claim their target *Setpoint* block.
- *PID* blocks will claim their target *PWM* or *Fast PWM* block.
- *PWM* blocks will claim their target *Digital Actuator* or *Motor Valve* block.
- *Digital Actuator*, *Fast PWM*, and *Motor Valve* blocks claim a single channel in their target IO Array.

Blocks or IO channels can only be claimed by one block at a time.
If you assign two *Setpoint Profile* blocks to the same *Setpoint*, the second *Setpoint Profile* will be inactive.

Blocks release their claim when disabled. In the above example, if you disable the first *Setpoint Profile*,
the second will immediately become active.

**Changes:**

- (feature) Added *Sequence* block.
- (feature) Added *Temp Sensor (External)* block.
- (feature) Added the *Fast PWM* block.
- (feature) Added optional soft start settings to *Digital Actuator* blocks.
- (feature) Added the Metrics part to the Builder.
- (feature) GPIO module errors are now shown in the *OneWire GPIO Module* widget, with the option to clear the error state.
- (feature) Added options in *Admin Page* -> *General Settings* to set date / time formatting
  - Available date formats: YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY, browser default.
  - Available time formats: 24H, 12H AM/PM, browser default.
- (feature) Dashboards, Layouts, and Services in the sidebar can now be moved to folders.
- (feature) Dashboards, Layouts, and Services in the sidebar are now shown in a tree view with collapsable groups.
- (feature) On the Spark 4, hold the OK button for 5 seconds to start Wifi provisioning.
- (feature) On the Spark 4, hold the OK button for 10 seconds to clear all Wifi credentials.
- (feature) Added the `BREWBLOX_UPDATE_SYSTEM_PACKAGES` flag to brewblox/.env. If `false`, updates will always skip apt updates.
- (feature) Built-up PID values such as I are now retained during controller software crashes or reboots.
- (feature) The Spark 2 and 3 now automatically fetch system time from internet NTP time servers.
- (feature) Streamlined target channel selection for *Fast PWM*, *Digital Actuator*, and *Motor Valve* blocks.
  - Target IO array and target channel are now combined into a single dropdown selection.
  - The channel selection dropdown shows which block currently claims each channel.
  - When a channel is selected, its current claimer is unlinked.
- (feature) The minimum downsampling step size is now configurable for history services using `--minimum-step`.
- (feature) You can now always click on Builder text labels to edit them.
- (improve) An error message is shown in the UI if the `history` service is not reachable.
- (improve) Long-running Graphs automatically reload when the number of live points exceeds the maximum.
- (improve) History graphs now update every 10s (down from 30s).
- (improve) Improved the *Troubleshooter* widget for Spark services.
- (improve) To prevent confusion, the default snapshot archive name has been changed from `brewblox.tar.gz` to `brewblox-snapshot.tar.gz`.
- (improve) The `spark-one` service is no longer present by default when Brewblox is installed.
- (improve) Timezone is now mounted in Docker containers where possible.
- (improve) Auto-generated block IDs for existing blocks now always use the block type, and not an interface type.
- (docs) Added documentation for installing a Tilt service on a Pi zero W.
- (docs) Updated reference documentation for Spark communication protocol.
- (docs) Added documentation for alternative hardware options for the service host.
- (docs) Added reference documentation for *Sequence* instructions.
- (docs) Referenced WG-Easy as an alternative approach to installing Wireguard for remote access.
- (fix) Fixed controller slowdown and hangups when one or more OneWire devices were disconnected.
- (fix) Remove block and continue when block data is corrupted on the controller.
- (fix) Resolved block create errors when the firmware assigns a numeric ID which is already known to the service.
- (fix) Fixed various broken links in documentation.
- (fix) Fixed Spark 4 Over The Air (OTA) updates.
- (fix) Spark 4 OTA updates no longer use a placeholder signing key.
- (fix) The UI no longer incorrectly shows the firmware update prompt when the controller repeatedly reconnects.
- (fix) The Spark 4 no longer sometimes goes into Wifi provisioning mode on startup.
- (fix) Confirmed values in the *Quick Actions* widget are now applied and updated correctly.
- (fix) SSR (+ only) modes in the GPIO editor no longer revert to standard SSR when the editor is re-opened.
- (fix) The Spark relations page now always correctly re-renders when switching between services.
- (fix) Resolved an error when clearing all blocks on a Spark service.
- (fix) Fixed the "Disable all setpoints" Quick Action generated by the HERMS Quickstart wizard.
- (fix) The *SysInfo* widget now correctly shows the IP address for Spark 4 controllers.
- (fix) Brewblox configuration directories are now created if they do not exist, and will not cause startup errors.
- (fix) The Spark 4 is now better able to switch between ethernet, Wifi, and Wifi provisioning.
- (dev) Firmware dates are now expressed as ISO-8601 date string.
- (dev) Added firmware-side implementation for block updates with partial data (patching).
- (dev) Replaced the "driving" mechanism with claims.
- (dev) Updated the published Spark state to be more explicit about connection status.
- (dev) Reorganized the firmware repository.
- (dev) Simplified the dev env setup for firmware development.
- (dev) Generic system settings were moved from the *Ticks* and *DisplaySettings* blocks to *SysInfo*.
- (dev) Removed the *Ticks* system block.

## Brewblox release 2022/01/21

**firmware release date: 2022-01-21**

The Spark 2 and 3 have suffered from intermittent hangups for some months now.
This problem turned out to be a combination of issues: the Spark deals badly with Wifi network changes,
and these errors were not handled correctly, causing the Spark to freeze instead of reboot.

We're still working on getting the underlying issue resolved for all scenarios, but we tracked the hangups to a bug in the system layer.
Particle has now released a fixed version of the system layer, so with this release we're hopefully rid of the hangups.

**Changes:**

- (improve) Graph fields now automatically use the default label when added.
- (improve) The Tilt service now becomes immediately visible in the UI, and not on first device update.
- (improve) The PID widget boil mode setting is now a single value, and not an offset from 100\*C.
- (improve) The PID widget now shows a quantity editor for minimum boil mode output if the target is a Setpoint Driver.
- (improve) Added Avahi and Docker daemon logs to `brewblox-ctl log` output.
- (docs) Added primer for analyzing `brewblox-ctl log` output.
- (docs) Added a separate section for service guides in user docs.
- (docs) Added Tilt and Plaato service guides.
- (dev) Updated brewblox-service to now make use of Pydantic for endpoint documentation.
- (fix) The Spark 2 and 3 should again reboot instead of freeze on hardfault.
- (fix) Tilt page is now scrollable.
- (fix) The Quick Actions diff is no longer erronously saved to the datastore.
- (fix) The UrlDisplay Builder part now functions correctly for relative paths.
- (fix) The installation of brewblox-ctl no longer sometimes fails because the Rust compiler is not available.

## Brewblox release 2021/11/29

**firmware release date: 2021-11-29**

On the firmware side of things, we have made progress hunting down the bug that causes hangups on the Spark 2/3.
We're still having problems consistently reproducing it, but have narrowed down the scope, and identified a likely fix.
The problem appears to be triggered by Wifi disconnects. This includes the router stopping or restarting, but also channel and repeater changes.

We improved the code that handles Wifi disconnects. The immediate effect is that the Spark no longer requires a fixed Wifi channel,
but we're not sure whether this resolves all hangups. Please let us know if you continue to experience them.

Apart from firmware bug hunts, we have also reworked the Tilt service to support custom and unique device names.
Previously, if multiple Tilt devices of the same color were detected, their data would be arbitrarily mixed.
Now, a unique name is generated for every Tilt. The default name is still the color, but after the first, it will increment the name.
For example, if you have three red Tilts, you will end up with the device names *Red*, *Red-2*, and *Red-3*.
You can set custom device names for all Tilts in the UI.

Existing calibration files are compatible with the first generated name. If you only have a single Tilt, you do not need to make changes.

The field names in the Tilt history data have changed. You will need to update the used fields in Graph widgets.

- `Temperature[degF]` / `Temperature[degC]` -> `temperature[degF]` / `temperature[degC]`
- `Specific gravity` -> `specificGravity`
- `Plato[degP]` -> `plato[degP]`

Before, the `Calibrated temperature` and `Calibrated specific gravity` fields would be added if calibration data was present.
Now, if calibration data is present, the default fields (`temperature`, `specificGravity`, `plato`) will show calibrated data,
and the `uncalibratedTemperature` / `uncalibratedSpecificGravity` / `uncalibratedPlato` fields are added to show raw data.

The UI now also supports setting a preferred unit for Specific Gravity values: unitless Specific Gravity, or degrees Plato.
The new *Display: Tilt* Builder part will show temperature and gravity in the preferred units.
Values for all units are still included in history data.

For a comprehensive overview of changes, see <https://github.com/BrewBlox/brewblox-tilt/issues/2>.
For setup and calibration instructions, see <https://github.com/BrewBlox/brewblox-tilt>.

**Note:** if Tilt data does not show up in the UI after updating, you may still be using the original third-party Tilt service.
To fix this, run `brewblox-ctl add-tilt -f`.

**Changes:**

- (feature) The Tilt service now generates unique names if multiple devices with the same color are detected.
- (feature) The Tilt service now supports custom device names.
- (feature) Added the *Steam Condenser* Builder part.
- (feature) Added the *Tilt Display* Builder part.
- (feature) Added *Ground* and *Power Only* channel types to the *OneWire GPIO Module* editor.
- (feature) The last used action in *Quick Actions* is now highlighted.
- (feature) Updated field names in history data published by the Tilt service.
- (feature) Preferred Specific Gravity units are now configurable in the admin page. The choices are SG and Plato.
- (feature) Blank lines and comments in `docker-compose.yml` will no longer be overwritten during `brewblox-ctl update`.
- (feature) Added the `brewblox-ctl termbin {FILE}` command. This generates a shareable termbin.com URL for a given text file (as used in `brewblox-ctl log`).
- (feature) Services and dashboards can now be hidden from view in the sidebar. You can toggle this setting in the admin page.
- (improve) brewblox-ctl will now explicitly disable IPv6 in avahi daemon configuration.
- (improve) brewblox-ctl no longer depends on `nc` being installed system-wide. This helps with running `brewblox-ctl log` on Synology systems.
- (improve) The brewblox install script lists required Apt packages if `apt-get` is not detected.
- (improve) brewblox-ctl no longer depends on `netstat` being installed system-wide.
- (improve) Removed `tio` and `net-tools` from installed apt packages.
- (improve) `brewblox-ctl http {METHOD} {URL} --pretty` now generates valid JSON.
- (improve) Generated mounted volumes in `docker-compose.yml` and `docker-compose.shared.yml` now use the more explicit syntax.
- (improve) Tilt data is now included when running `brewblox-ctl backup save`.
- (improve) Renamed `brewblox-ctl fix avahi-reflection` to `brewblox-ctl fix avahi`.
- (improve) The Tilt service now waits on startup until a Bluetooth dongle or chip is detected on the host.
- (fix) Resolved firmware hangups in the Spark 2/3 when the Wifi access point switches channels.
- (fix) Fixed a bug when importing a Builder layout that references a non-existent Spark service.
- (fix) Service overrides in `docker-compose.yml` that do not have a `image` field do no longer cause Spark discovery to crash.
- (fix) `brewblox-ctl` and the brewblox install script now use `apt-get` instead of `apt` to avoid conflicts on MacOS.
- (fix) `brewblox-ctl wifi` now correctly uses `pyserial-miniterm` instead of `miniterm.py`. Same program, different name.
- (fix) Tilt Bluetooth events no longer get drowned out by other non-Tilt Bluetooth Low Energy devices.

## Brewblox release 2021/10/29

**firmware release date: 2021-10-29**

Multiple users have recently reported frequent hangups. This is something we're actively working on, but so far have failed to consistently reproduce.
We identified two prime suspects in the firmware code, and fixed or improved the code there.
This includes the mDNS implementation, and the display rendering code.

Under the hood, brewblox-ctl was split in two parts: the generic *brewblox-ctl*, and the release-specific *brewblox-ctl-lib*.
This complicated releases, and required us to split the installation process in two commands:
`brewblox-ctl install`, and `brewblox-ctl setup`.
We've now unified brewblox-ctl, and switched to installing brewblox-ctl and all its dependencies in the Brewblox directory itself.
This makes the installation process cleaner and reduces the need for custom steps on non-standard platforms like Synology.
A minimal wrapper script is placed in `$HOME/.local/bin` or `/usr/local/bin` to keep the `brewblox-ctl` a valid command.

For fresh installs we created a downloadable install script at <https://www.brewblox.com/install>.
The startup guide provides the commands to download and execute it.
Once you have installed Brewblox, you can reinstall it by removing the Brewblox directory, and running `brewblox-ctl install`.

For existing installs, `brewblox-ctl update` will automatically migrate your system.

**Important: if you manually created a bash alias for the brewblox-ctl command, you will need to remove or update it**

**Changes:**

- (feature) Unified brewblox-ctl and its shared library (brewblox-ctl-lib).
- (feature) Merged `brewblox-ctl install` and `brewblox-ctl setup`.
- (feature) Added downloadable script to simplify first-time installation.
- (feature) The Logic Actuator can now be enabled/disabled as part of a Quick Action.
- (improve) Reduced the Spark service docker image in size.
- (fix) Resolved an issue where temperature unit settings would not be applied correctly if timezone was not specified.
- (fix) The Setpoint Profile display part in Builder now shows the correct current value.
- (fix) Restored "Import layout" to the Builder action menu.
- (fix) Made MDNS implementation on Spark 2 and 3 more robust.
- (fix) Resolved yield in display DMA completion wait function on Spark 3.
- (fix) Fixed display glitches on the Spark 4 when ethernet is connected.

## Brewblox release 2021/10/14

**firmware release date: 2021-09-20**

Due to popular demand, we added the *Countdown* widget.
Apart from this, and some minor usability improvements, we've taken the time to improve things under the hood.

We've been thinking for a while about making more use of the relations diagram in the Spark service page,
and have now implemented a new library that will let us do just that.
For now, everything looks pretty much the same, but you can expect some improvements here in future updates.

**Changes:**

- (feature) Added the *Countdown* widget.
- (feature) Switched to a new library for calculating the layout of relation diagrams.
- (improve) The relation between OneWire temp sensors and the OneWire bus is hidden in relation diagrams.
- (improve) Added - / + labels to the power block for the *OneWire GPIO Module* block.
- (docs) Added pin mapping and multiplication to the *OneWire GPIO Module* block documentation.
- (dev) Updated Python-based services to Python 3.9.
- (dev) Block relations and drive chains are now calculated server-side, and broadcast as part of the Spark state.
- (fix) Resolved an error where exporting channel / sensor names would crash when removing all blocks.
- (fix) `brewblox-ctl update` now makes sure the udev rules directory exists before copying files to it.
- (fix) `brewblox-ctl add-tilt` now correctly sets a flag to disable traefik routing, as the Tilt service has no REST API.

## Brewblox release 2021/09/20

**firmware release date: 2021-09-20**

This release includes an important bugfix for Spark 4 firmware,
and a re-implementation of the `brewblox-ctl wifi` command.

**Changes:**

- (feature) The `brewblox-ctl` wifi command works again.
  - For Spark 2 / 3, it triggers listening mode (blue blinking LED), and starts the built-in Wifi wizard.
  - For Spark 4, it prints instructions for Wifi provisioning over bluetooth.
- (feature) GPIO pin layout (- / + / GND / PWR) is now shown in the GPIO channel editor and widget.
- (feature) `brewblox-ctl update` now also tries to run `sudo apt update && sudo apt upgrade`.
- (improve) `brewblox-ctl add-spark` / `add-tilt` / `add-node-red` `add-plaato` now show a confirmation prompt if the service already exists.
- (improve) Added `--discovery=lan` as alias to `--discovery=wifi` for Spark service configuration.
- (fix) Spark 4 GPIO channels no longer affect other pins on the GPIO module.

## Brewblox release 2021/09/13

**firmware release date: 2021-09-13**

The first batch of Spark orders have been handed over to FedEx, and with this release, the Spark 4 is live.

**Changes:**

- (feature) Added the *OneWire GPIO Module* block and widget.
- (feature) Added a step to Quick Start wizards for setting pin assignments for GPIO channels (if any).
- (feature) Added timezone setting to admin page. For now, this setting is only relevant for the Spark 4 display.
- (documentation) Updated documentation to reflect differences between Spark 2/3 and 4:
  - The Spark 4 does not support USB connections. (Ethernet and Wifi only).
  - Spark 4 Wifi configuration is done using Bluetooth and the "ESP BLE Provisioning" Android/iOS app.
  - The Spark 4 never requires a separate bootloader flash.
- (dev) Updated block data types for all IoArray blocks. This is not a breaking change when loading backups.
- (improve) The controller will now attempt to automatically recover from OneWire errors caused by faulty devices.
- (improve) Under the hood, there are significant changes to the shared firmware code. These shouldn't be noticeable.

## Brewblox release 2021/08/09

**firmware release date: 2021-05-27**

This is a minor bugfix release as follow-up to the *2021/08/02* release.

**Changes:**

- (improve) Slightly reduced memory usage for `brewblox-ctl database from-influxdb`
- (improve) Improved efficiency when polling the Spark for history/state data.
- (fix) Widgets can no longer exceed screen width on mobile devices.
- (fix) *Date to now* mode for graphs no longer fails to yield data.
- (fix) The PWM duty setting field in the Quick Actions widget no longer immediately resets values.

## Brewblox release 2021/08/02

**firmware release date: 2021-05-27**

Our planning has been upset somewhat lately, with Elco taking parental leave a lot earlier than expected.
To compensate, we've shifted a non-firmware task forward: the replacement of our history database.

### New history database

InfluxDB announced that they will drop support for 32-bit architectures on 1/1/2022.
This is a deal-breaker for us, as Raspberry Pi OS has a 32-bit architecture.

We decided to go with [Victoria Metrics](https://github.com/VictoriaMetrics/VictoriaMetrics) as replacement,
as it had the best combination of features and small CPU/RAM/disk footprint.
For a more detailed explanation, you can find the decision document [here](https://brewblox.netlify.app/dev/decisions/20210718_victoria_metrics).

Database migrations are always a big step, but we're pretty happy with this one.
Broadly speaking, it's twice as fast, and uses half the memory.

Where the InfluxDB data required some custom handling,
the Victoria Metrics model is much simpler.
It's simple enough that you can [add a Grafana service](https://brewblox.netlify.app/user/services/grafana), and have it work as expected out of the box.

Your system will be immediately functional after updating, and will log data into Victoria Metrics. Older data will have to be copied from InfluxDB to Victoria.
For this, we made a [data migration command](https://brewblox.netlify.app/dev/migration/influxdb)

You can run the migrate command in the background. Depending on how much data you have, the migration takes minutes to hours.
Migrations can safely be stopped and restarted or resumed.
After the migration is done, you'll still have all your old history data in the `brewblox/influxdb/` directory.

### Tilt Service

James Sandford's brewblox-tilt service has been very popular for some years now, and we've decided to make it official.
James was happy for us to take over development and maintenance, so we [forked his service](https://github.com/BrewBlox/brewblox-tilt).
The new service comes with support for the Tilt Pro.

You can install the new Tilt service by running `brewblox-ctl add-tilt -f`.

### Graphical config editor

For common configuration changes, we add commands to brewblox-ctl.
You'll still sometimes have to edit the configuration files themselves.

Terminal text editors have a pretty steep learning curve, but by now the *Remote - SSH* plugin for Visual Studio Code is stable enough that we're happy recommending it.
This way you read and edit text files from the comfort of your own computer.

You can find the install guide [here](https://brewblox.netlify.app/user/config_editor.html).

**Changes:**

- (feature) Changed history database from InfluxDB to Victoria Metrics.
- (feature) Added `/victoria` endpoint. `/victoria/api/v1` is compatible with the [Prometheus HTTP API](https://prometheus.io/docs/prometheus/latest/querying/api/).
- (feature) Added `/history/timeseries` endpoints. For an overview, see `/history/api/doc`
- (feature) The "hide after" period for Graph and Metrics fields is now customizable. The default is still 1d.
- (feature) The maximized Graph widget is now a separate page with its own URL.
  - Refreshing the page will no longer close the graph.
  - You can bookmark the page to instantly visit the maximized graph.
- (feature) We now maintain the Tilt service.
- (feature) The Tilt service now supports the Tilt Pro.
- (feature) Added `brewblox-ctl add-tilt`.
- (feature) Added `brewblox-ctl database from-couchdb` command.
- (feature) Added `brewblox-ctl database from-influxdb` command.
- (docs) Added user guide for VSCode with SSH Remote plugin.
- (docs) Updated Troubleshooting guide.
- (docs) Added Grafana service install guide.
- (docs) Documented advanced usage of `brewblox-ctl database from-influxdb`.
- (improve) Added Apple PWA headers to the UI.
- (improve) `brewblox-ctl service remove` no longer requires the `-n/--name` option for services, and can remove multiple services at once.
  - OLD: `brewblox-ctl service remove -n spark-one`.
  - NEW: `brewblox-ctl service remove spark-one`.
- (deprecation) Removed the `brewblox-ctl service editor` command.
- (deprecation) Removed `/history/history` endpoints.
- (fix) The side pane graph in block widgets now correctly re-renders when the duration is changed.
- (fix) The builder layout is now always correctly centered when opening the widget dialog.

## Brewblox release 2021/05/25

**firmware release date: 2021/03/09**

For this release, we've made some significant improvements to the Builder editor, and adjusted our long-term plans for automation features.
For the latter, we decided to stop development on our own automation service, and focus on integration with third-party platforms such as [Node-RED](https://nodered.org/).
More on this below.

### Builder improvements

Until now, the Builder editor was unusable on mobile devices, to the point where we disabled it on small screens.
We tackled some of the biggest deficiencies, and reworked the tools to improve compatibility with touch devices.
The result is a much improved experience for everyone.

The Builder editor, widget, and page now all support mousewheel / pinch zooming.
You can drag to pan the view, eliminating the need for scroll bars.

To simplify navigation, the editor now uses the default sidebar.
You can select the active layout in the left sidebar, and editor tools from a sidebar on the right side.

Editor tools and mouse actions have been merged. Select a tool in the sidebar, and click or drag to manipulate part(s).
Keyboard shortcuts are still available, and act on hovered or selected parts.

With the ability to arbitrarily zoom and drag the layout, we have also repurposed the grid.
Parts can now be placed or moved anywhere, but the Builder widget will set the initial zoom level to make the grid fit the widget.
You can use this to manipulate the default placement and zoom level.
To help with this, we added a new editor tool: *Resize grid*. With this tool, you can click and drag to define a new grid area.

### Automation service deprecation

We've taken a long hard look at our automation service and its backlog, and concluded that we need to drastically curtail our ambitions here.

The purpose of the automation service is to support custom functionality that is not (yet) provided by the Spark firmware.
There are plenty of use cases for this, ranging from recipe integration to automated alerts to custom sensors and actuators.

Backlog estimates, and our experience making the main UI more user-friendly paint a less rosy picture.
The runtime engine for executing custom automation functionality is relatively simple.
Building an editor UI to handle all desired native and custom functionality is not complicated either, but it is *a lot* of work.
Making said UI intuitive and user-friendly while handling complex control logic takes even more work.

Brewblox is process control software with an emphasis on brewing. Adding a generic low-code platform would be a prime example of the [Not Invented Here](https://en.wikipedia.org/wiki/Not_invented_here) syndrome.

A happy compromise is to make our software compatible with one or more off-the-shelf low-code platforms.
The important thing is that users should not have to switch UIs when brewing.
This can be accomplished if the external editor is only required for creating the custom subroutines, and the Brewblox UI is used to start/stop/monitor them.

We've had good experiences with our prototype integration with Node-RED, and will continue development there.
Integrations with Brewfather, Home Assistant, and IFTTT are also under consideration.

To summarize:

- We are ending development of the current automation service.
- We will keep developing automation functionality.
- You can use a third-party editor to create and edit automation subroutines.
- You should not have to switch UIs during brew days or active fermentations.

### Automation editor deprecation

The UI components for the automation editor came with heavy dependencies.
We don't want to yank the rug out from underneath the users that already make use of the service, so we settled on forking the editor components to a separate service.
The new *automation-ui* service is added automatically if you have an *automation* service in your docker-compose.yml file.
You can access it by navigating to `/automation-ui`.
The *Automation* widget still exists, and will open the editor UI in a new tab if you click on a "edit process" button.

**Changes:**

- (feature) The Builder editor is now enabled on mobile.
- (feature) The Builder editor now uses the default sidebar.
- (feature) Added the *Pan* tool to the Builder editor.
- (feature) Added the *Resize grid* tool to Builder editor. Drag to define the new grid area.
- (feature) The Builder grid area is now used to set the default shown area in Builder widgets. Parts can be placed outside the grid.
- (feature) Scroll or pinch to adjust zoom in the Builder editor, Builder layout page, and Builder widget.
- (feature) Merged Builder editor *Mouse actions* and *Tools*.
- (feature) Placed Builder tools in the right-hand sidebar. Swipe to collapse/expand the sidebar.
- (feature) Reworked Builder tools to be compatible with both mouse/keyboard and touch-based interfaces.
- (feature) The *Valve* and *Actuator Valve* parts in Builder are merged into *Valve*. The valve is controlled manually if unlinked.
- (feature) Added drag-to-pan to the Builder layout page and Builder widget.
- (feature) Added toggleable scroll blocking overlays for the Builder widget on mobile dashboards.
- (feature) Renamed the *Display Settings* block to *Spark Display*.
- (feature) Spark system blocks can now be shown on dashboards. This includes:
  - *Spark System Info*
  - *Spark Display* (previously *Display Settings*)
  - *Spark 2 Pins*
  - *Spark 3 Pins*
- (feature) Changes in *Quick Actions* are automatically converted whenever the system temperature unit changes.
- (feature) Markdown-formatted text in session log notes is now rendered in the widget.
- (feature) The session log note editor now shows a Markdown preview to the side.
- (feature) Click on the dashboard/service/layout title in the top bar to edit.
- (deprecation) Deprecated the Automation service.
- (deprecation) Moved the Automation editor from the UI to a separate `automation-ui` service.
- (deprecation) The `automation-ui` service is added if the `automation` service is detected during updates.
- (deprecation) The *Automation* widget now links to the external editor at `/automation-ui`.
- (enhancement) When removing a block on the Spark page, the option is given to automatically remove dedicated widgets from dashboards.
- (enhancement) Improved responsiveness of dialog sizes.
- (enhancement) The block actions menu now shows what Spark service the block belongs to.
- (enhancement) Added custom styling for the dashboard page scrollbar.
- (enhancement) The message log in the bottom bar now renders html formatting.
- (enhancement) dashboard/service/layout titles are now shown centered in the top bar.
- (enhancement) All arguments to `brewblox-ctl up/down/restart` are passed through to the underlying docker-compose command.
- (enhancement) Date/Time pickers now use system-native input fields.
- (enhancement) Improved start/end date handling for graphs in the *Session Log* widget.
- (fix) After running `brewblox-ctl service remove`, the removed service is also stopped.
- (fix) The *RIMS* Builder part now has a minimum width of 3.
- (fix) Builder parts now show an error if the linked block is of an incompatible type.
- (fix) The *Stopwatch* widget now shows the correct time if the dashboard is reloaded while the timer is stopped.

## Brewblox release 2021/04/07

**firmware release date: 2021/03/09**

For this release, we've been looking at how to improve the general user experience.
The biggest change is that Brewblox now uses one single temperature unit setting.
This setting is automatically applied to the Spark display as well.

When you first open the UI after installing or updating Brewblox, it will prompt you to choose between Celsius and Fahrenheit.
The setting can also be found in the Admin page if you want to change it later.
Some limitations still apply: existing Graph / Metrics widget settings have to be updated manually after changing the temperature setting.

We have also made some improvements to the Spark service diagram view.
You can now use the scroll wheel to zoom in and out, and click and drag to reposition.
Pinch and drag is supported for touch screens.

The diagram is now the default mode when first opening the service page.
We feel that this provides better overview for novice users, but any and all feedback on this is welcome.

On the backend, the MQTT eventbus port (1883) is now exposed by default to reduce required setup steps for various integrations.
If this causes a port conflict (or you simply don't want to expose the port) you can override this setting using brewblox-ctl or the docker-compose.yml file.

For those wishing for remote access, we added a [tutorial for setting up a Wireguard VPN](https://brewblox.netlify.app/user/wireguard.html).
Many thanks to Douwe Houvast for the preparatory work!

We're still planning to support secure remote access natively, but a VPN is a decent workaround until we find the time to do it right.

**Changes:**

- (feature) Added global configuration setting for preferred temperature unit (Celsius / Fahrenheit). This setting is used by the UI and all Spark and Tilt services.
- (feature) The Spark service diagram is now the default/initial mode for the Spark service page.
- (feature) The Spark service diagram now supports drag and zoom. Use the scroll wheel to zoom, and click and drag to reposition.
- (feature) Replaced the toggle in the Spark service diagram with a button that resets zoom and position.
- (feature) Added menu action to export Session Log widget graphs to CSV.
- (feature) The 1883 eventbus port is now exposed by default.
- (feature) You can use `brewblox-ctl service ports --mqtt [PORT]` to change the eventbus port. Alternatively, you can edit the `BREWBLOX_PORT_MQTT` variable in `brewblox/.env`.
- (feature) The [brewblox-hass service](https://github.com/BrewBlox/brewblox-hass) now automatically publishes Tilt measurements to Home Assistant.
- (feature) Additional [Mosquitto configuration](https://mosquitto.org/man/mosquitto-conf-5.html) can now be defined by placing `.conf` files in `brewblox/mosquitto/`.
  - This is useful for sharing MQTT events between brokers, or defining additional (password-protected) listener ports.
- (enhancement) Quick start wizards now check for Spark services that were detected but not yet added to the UI.
- (enhancement) `brewblox-ctl backup` commands will now also include config files in `brewblox/mosquitto`.
- (enhancement) `brewblox-ctl update` no longer prompts whether to prune docker images and volumes. The default is true, but can be disabled with `--no-prune`.
- (docs) Added a guide for setting up a local VPN for safe remote access.
- (docs) Updated the startup guide to use the Raspberry Pi Imager for SSH/Wifi configuration on a new Pi.
- (docs) Added developer reference doc for using the datastore.
- (removed) Removed alternative `/history/query/XXXXX` routes for the `/history/history/XXXXX` endpoints. The API is otherwise unchanged.
- (fix) Removed blocks now immediately disappear from the Spark service page.
- (fix) Dashboard grid no longer is shifted if a widget is wider than the screen.
- (fix) Dashboard grid now correctly extends to the edge of the rightmost widget.
- (fix) Fixed a bug where the dashboard would not respond to adding / removing a widget.
- (fix) The dot indicators in the Logic Actuator widget now correctly toggle between red/green to show condition result.
- (fix) Disabled tooltips for the Quick Actions apply buttons in touch mode to prevent unwanted overlap. We'll be looking at a more comprehensive fix to the underlying problem.
- (fix) Temp Control Assistant no longer warns about undefined pin channels when using a Motor Valve block.
- (fix) Long URLs in the Web Frame widget no longer cause the input field to grow wider than the widget.
- (fix) Fixed a bug where the edges of blocks in the Spark service diagram were not clickable.
- (fix) The Spark service diagram now updates when a block without links is added or removed.

## Brewblox release 2021/03/09

**firmware release date: 2021/03/09**

The previous release fixed multiple Wifi-related issues, and added improved error handling. The latter lead us to another pre-existing bug, which is fixed by this release.

We now also support Spark simulation services on 64-bit ARM.

**Changes:**

- (feature) Added the ARM64 Spark simulator. Setup for simulators is the same on all platforms.
- (fix) Fixed a bug where the Spark would end up with too many open connections when connected to a Wifi repeater.
- (fix) Fixed the block list being emptied when clearing the search field on the Spark service page.

## Brewblox release 2021/02/25

**firmware release date: 2021/02/25**

This release fixes controller hangups when using Wifi, and provides a more permanent fix for IPv6-related issues.

When Wifi connections were less than perfect, the controller would slow down and freeze.
This was caused by the controller being slow to handle reconnects, which in turn caused memory issues.
We fixed the immediate problem, and improved handling for future out-of-memory errors.

We've been aware for a while now that there's a bug in Docker where if your router supports IPv6, starting a container will cause all network interfaces to be reset.
This often leads to the Pi freezing up completely.

Previously, we fixed this by disabling IPv6 completely (`brewblox-ctl disable-ipv6`).
The problem with this approach is that it also disabled IPv6 for all other applications on the server.

An alternative solution is much less invasive, and only requires a [change to the Docker settings](https://docs.docker.com/config/daemon/ipv6/).
This fix is applied during `brewblox-ctl install`, and during the next `brewblox-ctl upgrade`. It is also available as `brewblox-ctl enable-ipv6`.
Your next upgrade will also revert the configuration changes (if any) made by `brewblox-ctl disable-ipv6`.

**Changes:**

- (feature) Added `brewblox-ctl enable-ipv6`. This function also runs during install and once during your next upgrade.
- (removed) Removed `brewblox-ctl disable-ipv6`.
- (docs) Added reference doc on how Influx data is stored and downsampled.
- (docs) Added tutorial for setting up Chronograf to view raw history data.
- (enhancement) Improved `brewblox-ctl log` output, and made inclusion of system diagnostics optional.
- (fix) All open connections in firmware are processed immediately.
- (fix) Number of firmware Controlbox connections is limited to 4.
- (fix) The controller now resets if it runs out of memory.

## Brewblox release 2021/02/03

**firmware release date: 2020/11/02**

To add some more convenience for anyone using (mostly) unmodified fermentation setups, we added a new widget: the *Temp Control Assistant*.
This widget replaces the Quick Actions widget generated by most wizards.

The assistant provides a centralized UI for the most common user actions:

- Set Setpoint setting.
- Enable / disable all temperature control.
- Enable / disable the Setpoint Profile.
- Switch between Beer mode and Fridge mode.

This was formerly implemented using Quick Actions.
Temp Control Assistant is built with a more specific purpose, and lets us implement fermentation-specific functionality.
For example, we added a proper confirmation to reset start date to 'now' when enabling the Setpoint Profile.

PID configuration for Fridge mode / Beer mode is tracked by the widget. It will automatically prompt to keep block settings and mode settings in sync when either is changed.
This lets you toggle between Beer mode and Fridge mode without accidentally reverting tuned settings.

All Quick Start wizards except HERMS and RIMS now generate a Temp Control Assistant widget.
You can also extend your existing setup by manually creating a widget, and linking it to your Cool PID, Heat PID, and Setpoint Profile.
The Cool PID and Heat PID are both optional, making it suitable for use with heat-only / cool-only setups.

On the backend side, we now support 64-bit ARM operating systems.
Practically speaking, this means you can now flash your Raspberry Pi 4 with 64-bit Ubuntu Server.
The only thing that does not work out of the box is the Spark firmware simulator. We'll add ARM64 support for this in a later update.

**Changes**

- (feature) Brewblox now also support 64-bit ARM (aarch64).
- (feature) Added the *Temp Control Assistant* widget.
- (feature) Replace the Quick Actions widget with a Temp Control Assistant in multiple quick start wizards:
  - Fermentation fridge
  - Glycol-cooled fermenter
  - Brew kettle
  - Fridge without beer sensor
- (feature) Modified accidental touch prevention in Builder Widget / Layout page. Instead of holding, you now click once to highlight the part, and click again to confirm.
- (enhancement) The Web Frame widget now is rendered at 100% screen height on mobile devices. This matches Graph widget behavior.
- (enhancement) Added Apple Touch icon.
- (fix) Docker no longer warns about unset image architecture when updating brewblox-ctl libs.

## Brewblox release 2021/01/11

**firmware release date: 2020/11/02**

The various setting and configurable options suffered from being scattered throughout the UI.
To remedy this, we introduced the *admin* page.
Settings and actions for the system itself, and all dashboards, services, and Builder layouts can be found here.

For example, we merged all the temperature unit settings into a single menu.

The *Wizardry* button has been moved to the admin page.
To help new users, a prominent "Get Started" button is displayed if there are no dashboards.

The *Brewery* page already made it possible to show a maximized Builder layout.
This page is useful for kiosk mode or wall-mounted monitors, but unintuitive to find.
To remedy this, Builder layouts are shown alongside dashboards and services in the sidebar. Builder layout pages can be set as homepage for the brewblox UI.

We recognize this may be unwanted clutter for those who already have a lot of dashboards, and included the option to not display some or all Builder layouts in the sidebar.
These options can be edited using the new admin page.

For those using a touch screen and kiosk mode for Brewblox, virtual keyboards offered as browser extension or host application proved to be bugged, unworkable, or plain ugly.

We like the concept of having a wall-mounted kiosk mode monitor in your brewery, and decided to add our own virtual keyboard.
Input fields now let you open a virtual keyboard dialog to edit the value.

On mobile, the most intuitive way to close a settings dialog is to press the Back button on the phone itself.
Sadly, this does not work well when combined with dialogs that are shown without the page URL changing.

We have now implemented our own workaround to ensure that if you press the Back button, the UI behaves as expected:

- If a dialog is open, the dialog is closed.
- If multiple dialogs are open, only the top-most dialog is closed.
- If no dialogs are open, the browser navigates to the previous page.

To improve visibility for a popular service, we added a UI service and widget for the Tilt service.
The service page will show all currently publishing Tilt devices.

**Changes**

- (feature) Added a centralized admin page. The settings for dashboards, services, and builder layouts can be found here.
- (feature) The back button will now first attempt to close a single open dialog instead of navigating to the previous page.
- (feature) Added virtual keyboard support for input fields. The keyboard layout is configurable using the admin page.
- (feature) Added the Tilt service page.
- (feature) Added the Tilt widget.
- (feature) Content of the Webframe widget is now scalable.
- (feature) A popup is now shown to iOS+HTTPS users when the UI fails to make a websocket connection. The popup offers to redirect to HTTP.
- (feature) Builder layouts are now selectable from the sidebar.
- (feature) Added option to admin page to not show Builder layouts on sidebar.
- (feature) Added option to Builder layout actions to not show layout on sidebar.
- (feature) You can now toggle to show the Spark relations diagram scaled to fit the page.
- (feature) Added a menu to the admin page for configuring all service temperature settings.
- (feature) Builder value display parts now have a setting to toggle rendering the part border.
- (feature) Node-red data is now included in `brewblox-ctl backup save`.
- (feature) The touch delay in brewery layouts is now configurable using the admin page. Options are: *Always*, *Never*, *Only on mobile*. It defaults to *Only on mobile*.
- (docs) Updated and split the documentation for [history](https://brewblox.netlify.app/dev/reference/history_events) and [state](https://brewblox.netlify.app/dev/reference/state_events) events.
- (docs) Added a [Fermentation fridge guide](https://brewblox.netlify.app/user/ferment_guide) for new users.
- (enhancement) Replaced the "Waiting for datastore" notification with a spinner shown in the current page.
- (enhancement) The Setpoint Driver widget now also shows the setting field.
- (enhancement) Improved error messages when network calls failed.
- (enhancement) Improved scroll bar positions on pages.
- (enhancement) Added html formatting when blocks, widgets, dashboards, services, or builder layouts are mentioned in notifications.
- (enhancement) Confirmation and select dialogs now use the same color scheme as other input dialogs.
- (enhancement) Added Setpoint Profile display part to layout generated by Fermentation Fridge wizard.
- (enhancement) Reviewed the layouts generated by the Quick Start wizards, and disabled part borders where relevant.
- (enhancement) Improved the default quick actions for the fermentation fridge to better show whether the fridge is in beer or fridge mode.
- (removed) The *Brewery* entry has been removed from the navigator at the top of the sidebar. Page URL's remain the same.
- (removed) Removed the *Groups* action from the Spark action menu.
- (fix) Widgets are no longer sometimes removed when the dashboard ID is changed.
- (fix) Reduced memory footprint during `brewblox-ctl up` / `brewblox-ctl update`. This should prevent the Pi from running out of memory and killing services during startup.
- (fix) The Spark Device Info widget can now be selected again in the service page on mobile devices.
- (fix) Block widgets no longer fail to render live updates when opened in dialog on mobile.
- (fix) Graphs no longer sometimes show dotted lines.
- (fix) The heating icon in PID widgets and builder parts now correctly turns red when the heater is active.
- (fix) Icons are rendered correctly when viewing the Builder in Safari browsers.
- (fix) Widgets no longer jump to the old position for a split second when dragged to a new position on a dashboard.
- (fix) Current value is no longer sometimes rendered as `[Object object]` when confirming a quick actions value.
- (fix) The node-red dir is now assigned to the correct user during `brewblox-ctl add-node-red`.

## Brewblox release 2020/12/02

**firmware release date: 2020/11/02**

We added three new widgets this release, and updated the default settings for BK PIDs.

The *Web Frame* widget is a wrapper around the HTML [iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe) element.

The *Quick Values* widget lets you set multiple buttons and sliders for a single field to easily toggle between multiple settings without having to enter a new value.

The *Spark Sim Display* is built for simulation services.
It will render the Spark LCD screen on your dashboard.
For technical reasons, this widget is only available for simulation services.

We updated the default settings for some PIDs in HERMS, RIMS, and Brew Kettle wizards.
If you're still using the default settings after running one of these wizards, you may want to apply the new settings manually:

- Brew Kettle
  - Kettle PID
    - Ti: 10m
    - Td: 10s
- HERMS
  - HLT PID
    - Td: 10s
  - BK PID
    - Ti: 10m
    - Td: 10s
- RIMS:
  - Kettle PID
    - Td: 10s

Windows recently released [Terminal](https://www.microsoft.com/en-us/p/windows-terminal/9n0dx20hk701?activetab=pivot:overviewtab).
This comes with a built-in `ssh` command, which functions like `ssh` on Linux/Mac.
To keep instructions consistent, we now recommend Terminal in our install guide, but PuTTY/Git Bash still work just fine.

**Changes**

- (feature) Added *Web Frame* widget.
- (feature) Added *Quick Values* widget.
- (feature) Added *Spark Sim Display* widget.
- (feature) Added `brewblox-ctl add-node-red` command.
- (docs) The startup guide now recommends Windows Terminal.
- (improve) Block changes are now published immediately to other clients.
- (improve) The Quick Actions editor now shows a warning if Block was not found.
- (improve) Updated PID default settings for PIDs in HERMS, RIMS, and Brew Kettle wizards.
- (fix) Increased Spark command timeout to handle wifi channel switches.
- (fix) Datastore writes no longer fail if the eventbus is not connected.
- (fix) The Spark Device Info widget is now visible again on the service page.
- (fix) Widgets no longer respond to arrow keys when dashboard is not editable.
- (fix) Dashboards no longer show a scroll bar if the contents fit on screen.
- (fix) Added help text for `brewblox-ctl add-plaato` command.

## Brewblox release 2020/11/03

**firmware release date: 2020/11/02**

A smaller release again, prompted by us fixing a critical bug.

Also included is the option to show older fields in the Graph settings.
By default, only fields that published data the last 24h are included.
You can now check the "include old fields" option to show any and all fields that ever published to the history database.

**Changes**

- (feature) Graph settings now have a toggle button to show all fields present in the database (including stale ones).
- (feature) Blocks now have a toolbar action to add their fields to a Graph widget.
- (improve) When choosing a new block for one of the LCD screen display slots, you will also be asked to update its label.
- (improve) In Quickstart wizards, improved visibility for the section that lets you choose block names.
- (fix) Fixed a bug in firmware where setting a 100hz PWM to 0 did not turn off the actuator.

## Brewblox release 2020/10/29

**firmware release date: 2020/10/11**

On recent versions of iOS, browsers refuse to connect to WebSockets that use a self-signed SSL certificate, even if the user explicitly marks the certificate as trusted.
Brewblox uses self-signed SSL certificates and WebSockets.

It appears that Apple has no intentions of fixing this bug anytime soon, so we implemented a workaround on our side.
We originally switched to HTTPS-only because of technical limitations imposed by browsers on HTTP connections.

This workaround doesn't fix WebSockets over HTTPS, but it enables using the UI over HTTP.
If you are using an iOS device, then the UI should be functional when using HTTP.
If you are using anything else, either HTTP or HTTPS will work.

As a bonus, we improved UI load times for everyone.

**Changes**

- (feature) Made the UI functional when using HTTP.
- (feature) Disabled automatic redirection of HTTP to HTTPS.
- (fix) Fixed datastore check when UI loads.
  - Still not 100% sure whether this solves all variants of the problem.
- (improve) Reduced UI startup time.
- (api) Renamed `/history/query/*` routes to `/history/history/*`.
  - `/history/query/*` is still supported for now, but will be deprecated in a future update.
- (fix) `brewblox-ctl snapshot load` now makes sure the target directory exists before extracting the archive.

## Brewblox release 2020/10/19

**firmware release date: 2020/10/11**

*brewblox-ctl* uses Python. Python 3.5, the default version for Raspbian Stretch, was discontinued in september.
Raspbian does not support upgrading Python versions.
If you are not yet running the latest Raspbian (Buster), we strongly recommend re-flashing your SD card.
For those unsure of which Raspbian version they're using: *brewblox-ctl* will warn you if your Python version is unsupported.

*brewblox-ctl* still works on Raspbian Stretch,
but depends on other software projects that have announced they will soon no longer be compatible with Python 3.5.

We added commands to *brewblox-ctl* to make it easy to move your Brewblox installation without losing any settings or history data.
For more information, see [our system upgrade guide](https://brewblox.netlify.app/user/system_upgrades).

The PWM block has also received a minor rework, both in firmware, and in the UI.
In the firmware, we fixed an issue where the PWM overcompensated for setting changes after it had spent a long period at either 0% or 100%.
In the UI, we reworked the widget to improve visibility of desired setting, actual setting, and achieved value.
We also added a slider to the Basic version of the widget,
making it much easier to control.

In response to [this thread](https://community.brewpi.com/t/integrating-brewblox-with-home-assistant/4628),
we created an experimental [service for sharing data with Home Assistant](https://github.com/BrewBlox/brewblox-hass).
It will be some time before we find the time to significantly extend this service, but the concept is promising.

**Changes**

- (docs) Added system upgrade guide.
  - <https://brewblox.netlify.app/user/system_upgrades>
- (docs) Added service architecture doc.
  - <https://brewblox.netlify.app/dev/service/architecture>
- (feature) Added the `brewblox-ctl init` command. This creates a brewblox dir. It is also part of `brewblox-ctl install`.
- (feature) Added the `brewblox-ctl snapshot save` command. This zips the entire brewblox dir. It is more complete, but also takes much more space than `brewblox-ctl backup save`.
- (feature) Added the `brewblox-ctl snapshot load` command. This restores snapshots created by `brewblox-ctl snapshot save`. You can also use `brewblox-ctl install --snapshot ARCHIVE`.
- (improve) `brewblox-ctl` now shows a warning if the Python version is unsupported (currently 3.5 or earlier).
- (feature) Added the *Stopwatch* widget.
- (improve) Reworked the PWM widget.
  - Desired setting is now set by using a slider.
  - It clearly shows when the PWM is driven, and setting can't be set manually.
  - Improved rendering of desired setting, actual setting, and achieved value.
- (feature) Added the brewblox-hass service as proof of concept for Home Assistant integration.
  - <https://github.com/BrewBlox/brewblox-hass>
- (improve) Reworked discover/connect behavior in the Spark service to reboot the service less frequently.
- (improve) Invalid `command` arguments in services now generate a warning, but do not immediately cause the service to exit.
- (improve) The UI now shows the Spark Troubleshooter if the service is running, but does not respond to status requests.
- (improve) The Spark Troubleshooter now shows whether a firmware update is in progress.
- (improve) Increased brightness for some text elements on the Spark display screen.
- (improve) System objects with no persistent data are no longer stored in persistent memory.
- (fix) Possibly fixed a bug where the UI would show its "waiting for datastore" notification even when the datastore already is available.
  - We're not sure about this one, as we couldn't consistently reproduce the error.
- (fix) The PWM no longer overcompensates for setting changes after spending a long time at 0% or 100%.
- (fix) If changing block settings would cause the Spark to run out of persistent memory, the old block settings are retained.

## Brewblox release 2020/09/23

**firmware release date: 2020/09/22**

After one too many "Waiting for datastore..." notification, we decided to go looking for a replacement.
[We evaluated multiple candidates](https://brewblox.netlify.app/dev/decisions/20200902_redis_datastore.html), and decided to try Redis as a replacement.
This trial was a success. For our purposes, Redis is simpler, faster, and more reliable than CouchDB.

Your data will be migrated automatically, and the old CouchDB data will be moved to `brewblox/couchdb-migrated-{DATE}`.

`brewblox-ctl backup load` is backwards compatible with archives generated by `brewblox-ctl backup save` during previous releases.

We also added a new block: *Temp Sensor (Combined)*. This is a sensor where the value is the min/max/average value of multiple other sensors.

This release includes a new system layer and bootloader.
If your Spark is connected to a Wifi network, the bootloader will be updated automatically.
If not, you can follow the instructions in `brewblox-ctl flash` to update the bootloader.

If your Spark is connected to the service using USB, then the UI update will throw an error.
The fix for this is included in the new firmware. To get this update you'll have to use `brewblox-ctl flash`.

**Changes 2020/09/28**

- (feature) Added Spark service action to reboot the service.
- (improve) Non-fullscreen graphs are now static on mobile.
- (feature) Long press on graph widget to open fullscreen.
- (fix) Creating a Setpoint with default settings no longer causes an "invalid magnitude for Quantity" error.
- (fix) Resolved a bug where fetching graph data would fail for some users.

**Changes**

- (feature) Added the *Temp Sensor (Combined)* block.
- (migrate) Replaced the CouchDB datastore implementation with Redis.
- (remove) Removed deprecated AMQP listener in brewblox-history.
- (remove) Removed deprecated `brewcast/state/{SERVICE}/blocks` publish in Spark service.
- (improve) Setpoint blocks now always show their enable/disable toggle.
- (improve) Builder no longer opens the editor when double clicking.
- (improve) When using a touchscreen, interaction with Builder parts now requires a long press.
- (improve) Added hint of how and when to flash the bootloader to the output of `brewblox-ctl flash`.
- (update) Updated the firmware system layer from 1.5.2 to 2.0.0-rc1.
- (fix) Improved stability of firmware / bootloader updates.
- (fix) Graphs no longer show a line between the last and the first point after config changes.
- (fix) If you open a new update dialog while the update is in progress, it will now receive update log messages.
- (fix) Fixed default values in the Spark wifi config menu.

**Automation changes**

- (improve) Added `isLessThanEqual(other)` alias for the `qty().lte()` function in automation sandbox.
- (improve) Added `isGreaterThanEqual(other)` alias for the `qty().gte()` function in automation sandbox.
- (improve) Set a timeout of 10 seconds for automation sandbox scripts.
- (fix) Signficantly reduced memory usage of automation service.

## Brewblox release 2020/08/31

**firmware release date: 2020/08/24**

This is a small update to the 2020/08/26 release.

**Changes**

- (fix) Session log graph notes no longer incorrectly show an error that end date is before start date.
- (fix) Restored the pause/resume autoconnect button in the Spark troubleshooter.
- (fix) The `traefik` service now correctly restarts after a Pi reboot.
- (feature) Added the `brewblox-ctl service pull` command, that can be used for updating single services without performing a full `brewblox-ctl update`.
- (improve) Added current status for Brewblox service containers to `brewblox-ctl log` output.
- (improve) `avahi-daemon` is added to the list of apt packages installed by `brewblox-ctl install`.

## Brewblox release 2020/08/26

**firmware release date: 2020/08/24**

This release is bigger (and took longer) than usual.
We're introducing new features, but we're also working towards having a stable and well-documented API that can be used for hobby projects or third-party applications.

To make the automation service more flexible, we're introducing scripted actions and conditions. These provide an alternative to the existing UI-based configuration.

Brewblox is gradually becoming more stable, and we decided now is a good time to add public documentation for block data types.\
This will help anyone who wants to listen in on block state events or use their own service, script, or application to read or write blocks.

Recently, we switched from AMQP events to MQTT.
We're very happy with how this turned out, and are now updating the `eventbus` service to run Mosquitto.
This lets us use some very useful MQTT features that were not available in RabbitMQ.

The infrastructure for Spark discovery over Wifi has been improved,
resulting in the removal of the `mdns` service.

We also added two more Quickstart wizards, and gave the block / block widget wizards an overhaul.

### Automation scripts

While implementing automation functionality, the limitations of a fully UI-based configuration became noticeable.
If the action or condition is repetitive, complicated, or uncommon, then it quickly becomes cumbersome or even impossible to configure.

Our solution is to implement an optional [JavaScript sandbox](https://brewblox.netlify.app/user/services/automation_sandbox) for actions and conditions.

Some of the highlights:

- The scripting API is optional.

Scripts are not a replacement for UI-based configuration.
They are an extension of the Brewblox design philosophy, where we build everything to be flexible and accessible, but add shortcuts to make the popular easy.
Here, scripts provide the flexibility, and the UI-based options are the shortcuts.

- The UI code editor helps.

The script editor has multiple features to make it easier to write and test your scripts.

While editing, you can run the script in the automation service, and immediately see the output.

We also added snippet generators for common functionality.
These snippets can ask you some questions, and will then generate code.

For example, the `Get block field` snippet will show you a dropdown to select a block and field,
and will then add the `getBlockField()` function call with the arguments already filled in.

- Helper functions are included.

There are functions to get and set block values, but also to help you check values.
For example, the `qty(value, unit)` function helps you write conditions where unit conversion is handled automatically.

### Block types

With the introduction of the automation scripting sandbox, users can now access the raw block data.
To help with that, we're declaring blocks a public interface, and added [reference documentation](https://brewblox.netlify.app/dev/reference/block_types.html).\
Starting with the next release, we'll use a deprecation period if we have to make any breaking changes to block data types.

### Eventbus migration

In the 2020/06/15 release, we started to migrate from the AMQP event protocol to MQTT.\
This release we're making the MQTT-only Mosquitto broker the default image for the `eventbus` service.

We're not aware of any third-party service still relying on AMQP,
but you can switch back to using RabbitMQ if you want to.

To do so: add the following service override to your docker-compose.yml file.

```yaml
  eventbus:
    image: brewblox/rabbitmq:${BREWBLOX_RELEASE}
```

Do note that the deprecation period for AMQP support ends 2020/09/15.
After that, all AMQP events will be ignored.

### mDNS changes

Previously, Brewblox used a separate service to do Wifi discovery of Spark controllers.
We've revisited this design, and replaced it with a change to the avahi-daemon configuration on the host.

This means we now have one less service, and **no longer use port 5000**.
For more details, see [the decision document](https://brewblox.netlify.app/dev/decisions/20200822_avahi_reflection.html).

This change does depend on the host environment and network layout.
The change to Avahi settings is kept optional, and we mapped multiple alternatives.
If you want to run Brewblox on a system without Avahi,
or are having problems with the new settings,
feel free to drop us a message.

### Wizardry

This release includes two more Quick Start wizards: *Brew kettle*, and *Fridge without beer sensor*.

*Brew kettle* produces a control chain for a single input/output heater,
comparable to the BK in a HERMS setup.

*Fridge without beer sensor* produces the same output as the *Fermentation fridge* wizard,
but without the beer mode controls.
This is useful if you wish to (temporarily) use your fermentation chamber as a normal fridge.

A common issue when running Quick Start wizards was that you'd arrive at the hardware step,
and then had to figure out if your beer sensor was `New|TempSensorOneWire-1` or `New|TempSensorOneWire-2`.

We can't magically decide what the purpose is of a newly discovered sensor,
but we can help with identification.\
Most wizards now start with a discovery step.
Here you are shown the current status and measured value of available OneWire sensors and chips,
with prominent "change block name" buttons.\
Unplug a device, and one of these blocks will suddenly have a *disconnected* status.

Block (widget) wizards were somewhat clunky, so we reworked those,
and added a *New Block* option to wizardry.\
In the *New Widget* wizard you can create a widget that is based on either a new, or an existing block.\
In the *New Block* wizard you can create a new block,
and optionally add a widget for displaying your block on a dashboard.

**Changes**

- (improve) Changed the default eventbus broker from RabbitMQ to Mosquitto.
- (remove) Removed support for UI plugins.
- (feature) Added the *New Block* wizard to the Wizardry menu.
- (feature) Quick Start wizards now have a step for identifying and renaming discovered blocks.
- (feature) Added the *Brew kettle* Quick Start wizard.
- (feature) Added the *Fridge without beer sensor* Quick Start wizard.
- (feature) Added a Builder part for the *Setpoint Driver* block.
- (improve) If the PID is controlling a Setpoint Driver, values in *PID* and *Setpoint Driver* parts are automatically converted to user temp units.
  - The underlying value is still unitless degC.
- (improve) Added a *Setpoint Driver* part to the Builder layout generated by the *HERMS* Quickstart wizard.
- (feature) `brewblox-ctl setup` and `brewblox-ctl update` [enable reflection in the avahi-daemon config](https://brewblox.netlify.app/dev/decisions/20200822_avahi_reflection.html). This removes the need for a separate `mdns` service.
- (remove) Removed the `mdns` service.
- (improve) The Spark service no longer relies on the `mdns` service for Wifi device discovery.
- (improve) Spark device discovery in `brewblox-ctl` no longer requires pulling and running an `mdns` container.
- (improve) Removed the `--mdns-port` setting from `brewblox-ctl service ports`.
- (documentation) Added documentation for the state/history events published by the Spark service.
  - These events are now considered a public interface, meaning we'll strive to make any changes backwards compatible. A deprecation period will be used if this is impossible.
- (documentation) Added documentation for block types. You can find it at <https://brewblox.netlify.app/dev/reference/block_types.html>.
  - Blocks are now also considered a public interface spec.
- (improve) Updated traefik and traefik label syntax to v2.
- (feature) The *DS2408* block can now toggle between Valve mode and Actuator mode.
- (feature) The last controller actions before shutdown are now logged when the Spark service connects. This will help us debug controller crashes.
- (improve) The UI now immediately shows updated status if the Spark service stops or crashes.
- (improve) If the Spark service is unable to connect to a controller, it will gradually increase the retry interval.
  - The minimum interval is 2s, the maximum is 30s. After 20 failed attempts, the service increases the interval, and restarts.
  - The retry interval is reset when a connection attempt succeeds.
- (improve) Generated (default) labels in Graph/Metrics widgets now support degree units other dan Celsius/Fahrenheit/Kelvin.
  - For example: `sensor/value[degP]` will have the default graph label `[sensor] value °P`.
  - This change is not applied retroactively. To update the default label, remove and re-add the field.
- (feature) The legend in graphs now shows the latest value for each field.
- (improve) Improved dialogs for selecting blocks / block fields.
- (feature) In dashboard edit mode, you can now move selected widgets by using the arrow keys.
- (feature) In Brewery Builder, you can now move selected parts by using arrow keys.
- (feature) You can now double click on widgets to toggle between Basic and Full modes.
- (improve) Improved the block wizard and block widget wizard layout.
- (improve) Overlaid dialogs now show a "back" button instead of a "close" button.
- (feature) Added the `brewblox-ctl add-plaato` command to add a service for the Plaato digital airlock.
- (feature) Added the `brewblox-ctl makecert` command to generate SSL certificates.
- (feature) Added the `brewblox-ctl libs` command to reload the release-specific commands.
- (improve) Tweaked Influx settings to reduce SD card wear and tear.
- (improve) Added `dmesg` to the log generated by `brewblox-ctl log`.
- (improve) `brewblox-ctl add-spark` now shows a warning if an existing Spark service is found that has no `--device-id` or `--device-host` flag set. This prevents errors where both services attempt to connect to the same controller.
- (improve) `brewblox-ctl setup` no longer create the Home dashboard and spark-one service in the UI. Quick Start wizards and service autodiscovery made presets redundant.
- (improve) Added the `--quiet` flag when installing Python packages in `brewblox-ctl update`.
- (improve) If the digital actuator state is pending, the Valve part will now show a spinner. This mirrors behavior of the ON/OFF button shown in digital actuator / valve / pin array blocks.
- (improve) The enable/disable toggle in blocks is now more consistent, and mentions which block is (or isn't) driven.
- (update) Updated device-os in firmware to 1.5.2, with fix for uninitialized variable in network handler.
- (improve) Improved test coverage tooling in firmware.
- (fix) Fix rounding errors when converting Celsius to Fahrenheit in firmware.
- (fix) Reduced impact of OneWire disconnects and communication errors in firmware, so they do not slow down the system.
- (fix) The history service now correctly discards invalid history event data.
- (fix) Fixed a bug where min/max range overrides in the Graph were converted to string values.
- (fix) Dashboard widgets no longer make sudden large jumps when being dragged.
- (fix) The *Setpoint Profile* graph is no longer sometimes initially rendered much smaller than the widget.
- (fix) Fixed a bug where Spark blocks were not correctly logged in `brewblox-ctl log`.
- (fix) Moving widgets no longer causes a document update conflict in the datastore.
- (fix) The shelf height in the Fridge part is now editable again.

**Automation changes**

- (improve) Improved visibility for inactive automation elements.
- (improve) The title property is now editable when adding a new automation action/condition.
- (improve) The automation editor is now enabled on mobile or small screens.
- (fix) The automation editor now shows the correct template when loading a `/ui/automation/<template-id>` URL.
- (feature) Added `Scripted action`.
- (feature) Added `Scripted condition`.
- (feature) Added code snippet generators to the script editor.
- (improve) *Block value* conditions now correctly convert quantity values (eg. degC/degF) if the condition and block use different units.
- (fix) HTTP Request action errors now show the error, and not just "request failed with status code XXX".
- (fix) Changing block links in the *Block change* action no longer causes an error.

## Brewblox release 2020/06/23

**firmware release date: 2020/06/23**

To fix issues with potential hangups in DS2413/DS2408 extension boards, we rewrote the code for OneWire devices to be simpler and better testable.

Down the line, this also allows for using simulated OneWire blocks in the firmware sim, and better feedback for when faulty devices are connected to the bus.

**Hotfix 2020/07/01**

- Fixed a typo in the reference enum (setting / measured) for the SetpointDriver block
- If saving a widget or dashboard causes a datastore error, an error message is shown, and the object is rolled back to the latest state in the datastore. You can then retry the change.
- Empty event messages sent by disconnecting services no longer cause an error in the UI.

**Changes**

- (improve) OneWire classes for DS18B20, DS2413 and DS2408 have been rewritten from scratch.
- (improve) Mock implementations of these devices and a mocked OneWire bus have been added.
- (improve) Simulation and unit testing of OneWire hardware is now possible and has been added.
- (improve) OneWire communication errors are now simulated and tested
  - Details: <https://github.com/BrewBlox/brewblox-firmware/pull/234>
- (improve) Added the `--no-pull` option to `brewblox-ctl setup`. This can be used for configurations that explicitly want to use locally built or retagged images.
- (fix) Fixed sizing and alignment for some icons in Builder parts.

**Automation changes**

- (fix) Blocks with only readonly fields can now be used in Block Value conditions.
- (improve) Changed "exit process" tooltip in automation widget to "close and remove process".
- (feature) Request headers are now editable in the Webhook action.

## Brewblox release 2020/06/15

**Firmware release date: 2020/06/07**

While evaluating what will be next for the automation service, we spent this release improving the internals of Brewblox.

The biggest change is that we decided to use a different protocol for eventbus messages (used to publish history data).
The short version is that the MQTT protocol is more lightweight, and can be used by external scripts and services without exposing the 5672 port.
The details of the how and why are described [here](https://brewblox.netlify.app/dev/decisions/20200530_mqtt_events.html) and [here](https://brewblox.netlify.app/dev/decisions/20200606_replacing_rabbitmq.html).

The existing protocol will be supported until **2020/09/15**.

After that, services and scripts that publish history data will have to use MQTT to be compatible.
We updated the [boilerplate repository](https://github.com/BrewBlox/brewblox-boilerplate/blob/develop/YOUR_PACKAGE/publish_example.py) and the [script tutorials](https://brewblox.netlify.app/dev/tutorials/pubscript/) to provide code examples.

The immediate advantage is that Brewblox needs one less Docker container: the *emitter* service was used to convert AMQP events to a protocol usable by the UI.
The UI can now subscribe directly to MQTT events, eliminating the need for the emitter service.

**Changes**

- (feature) Brewblox now uses the MQTT protocol for history events. AMQP is still supported, but will be disabled in three months.
- (improve) Removed the emitter service.
- (improve) The integral in the PID now adds P+D every interval instead of only P.
- (improve) Significantly reduced CPU usage in the Spark service when communicating with the controller.
- (improve) Spark page behavior (list/relations, sorting mode) is no longer shared for all users of the UI.
- (improve) Reduced output noise during brewblox-ctl setup
- (improve) Improved handling for the Pump part:
  - If no block linked, it will toggle manually, and use part settings to remember on/off.
  - If a block is linked, but does not exist, it will show an error.
  - If a digital actuator is linked, it will toggle the block when clicked.
  - If a PWM is linked, it will show a slider dialog when clicked.
- (improve) Reduced line stretching when the carboy is scaled.
- (feature) Timestamp formatting when exporting history data to CSV is now configurable (nanoseconds, milliseconds, seconds, ISO 8601-string).
- (feature) The troubleshooter now shows an "update firmware" button when firmware is incompatible.
- (fix) Fixed too much config being imported when adding a block to the graph widget.

**Changes (automation)**

- The Webhook action now has a "Try it" button in the template editor.

## Brewblox release 2020/05/27

**Firmware release date: 2020/05/13**

For the last few months, we have been working on building advanced process control for Brewblox.
After all: brewing is a process with multiple distinct steps.
Currently, Spark settings must be changed multiple times over the course of a brew day.

We aim to streamline this, so you only have to press "start" and "next" during a brew day.

This is implemented as the new *automation service* on the Pi.

**The service is currently in alpha / preview, and is not yet enabled by default**

You can use the UI to build processes with branching or repeating steps.
The service runs processes in the background, and can interact with all Brewblox devices.
This includes Spark controllers, but also third-party devices and REST APIs.

Processes can use sensor values from one device to adjust settings on another device.
They can also integrate manual actions by creating tasks for the user, and then waiting until the task is marked as done.

Later features will include integration with recipe formats such as beer.xml.

Everything else in Brewblox will keep working as usual.
The automation service is and will be completely optional.

We'll make an announcement when the automation service is sufficiently polished and stable for general release.
For now you'll see release notes split between regular changes, and those concerning automation.

For those wanting to try the preview version, we added a short [guide](https://brewblox.netlify.app/user/services/automation).

**Changes**

- (improve) Widgets now show hints / get started buttons when empty.
- (feature) Some builder parts are now scalable. This applies to parts that did not previously have size sliders, and do not include tubing.
- (feature) Merged the PwmPump and Pump parts in Builder. If you had a PwmPump, it is automatically migrated.
- (feature) Value display parts now can act as tube. Do note that scaling parts with flow enabled rapidly increases flow calculation time.
- (feature) The Graph Widget now has an action to quickly add fields from specific blocks.

**Automation changes**

- (feature) Added webhook action
- (improve) Changed Create Task to Edit Task.
- (improve) Condition tasks are now created at step start.
- (improve) Steps and focused phase (conditions / actions / transitions) are now shown side by side.
- (fix) You can now use readonly fields as a condition.
- (feature) You can now select all options when changing task status.

## Brewblox release 2020/05/14

**Firmware release date: 2020/05/13**

This release fixes a bug where Digital Actuators would "freeze" under certain circumstances.

We also added a new command to brewblox-ctl: `brewblox-ctl service expose`. This sets or clears exposed ports for any service.

So far, the most common use case is to expose the eventbus port.
You can do this by running `brewblox-ctl service expose eventbus 5672:5672`.

Earlier this week, we also published some tutorials for adding straightforward scripts that interact with Brewblox. You can check them out at <https://brewblox.netlify.app/dev/>.

**Changes:**

- (feature) Spark services can now be paused. The service will wait with discovering / connecting a controller until the status is cleared.
- (feature) Constraints are now settable in Quick Actions.
- (feature) Added a scale slider to the Brewery Page. This allows rendering the same layout in a sensible size in both the Builder Widget, and the Brewery Page.
- (improve) Changed the layout selector dropdown in the Builder Editor to use a tab. This hopefully improves visibility.
- (defaults) Increased the default Kp for the Glycol Quickstart wizard heater from 20 to 100 1/degC.
- (feature) Added the `brewblox-ctl service expose` command.
- (improve) Increased filtering for derivative a bit again to reduce effect of limited sensor resolution for slow processes with high TD.
- (fix) Fixed interval for periodic check on digital actuators to verify that desired and actual state match.

## Brewblox release 2020/05/04

**Firmware release date: 2020/05/03**

### Spark simulator

We now officially support Spark simulation on the Raspberry Pi.
This means that you can run a fully simulated Spark, instead of the actual hardware, to experiment with settings, or try before you buy.
The code used by the simulator is the actual firmware code running on the Spark, with some changes for simulation of course.

From now on, the simulator is embedded in the devcon container. If you used the preview simulator, please update by running

```sh
brewblox-ctl add-spark --name spark-sim --force --simulation
```

### New MDNS library (firmware)

We found out that one of the reasons for instability was running out of memory.
A big consumer of memory was a third party MDNS library. MDNS resolves .local addresses and automatically finds your Sparks on the network.

Elco refactored the MDNS library to use much less memory and cpu.
It is [available here](https://github.com/BrewBlox/particle-mdns/tree/develop) to use in your own projects.

[PR #217](https://github.com/BrewBlox/brewblox-firmware/pull/217)

### Interpolate values in output of slower filter stages (firmware)

Sensor data runs through max 6 filter stages. Each stage runs at a slower update rate as the previous.
This resulted in blocky output for slow filters.
I added linear interpolation between values of slower updated filters, for a smooth output.
See the image below for the before and after.

![image](https://user-images.githubusercontent.com/1708921/80886065-04c64900-8cbe-11ea-8319-8139ffee9e34.png)

[PR #225](https://github.com/BrewBlox/brewblox-firmware/pull/225)

### PID improvements to make the derivative much more usable (firmware)

The PID reads the derative from a certain filter stage depending on the value of the Td time constant.
The default filter it selected was very slow, larger than Td, to not have much noise.
But this meant that the derivative used by the PID was also delayed a lot. Not helpful if you want to prevent overshoot!

With the new filter implementation, the PID can work with a lot less filtering, and the selected filter delay is now 25-50% of Td.
The derivate part will also only be active if it counteracts the proportional part (if it prevents overshoot).

You'll find that the derivative part of the PID is now a lot more predictable and more effective.

[PR #226](https://github.com/BrewBlox/brewblox-firmware/pull/226)

### PWM improvements to look more towards the future (firmware)

The calculations for the achieved PWM value only looked back, not ahead. This meant the PWM value always lagged the setting.

- The PWM now looks ahead for what it can achieve and limits how far it looks back.
- When at 0% or 100%, the achived value now also slowly changes.
- A minimal low/high time is introduced to prevent two short bursts when the setting increases quickly.

[PR #217](https://github.com/BrewBlox/brewblox-firmware/pull/217)

### Reduce memory used by filters in setpoints (firmware)

Another change to reduce memory use is to create filter stages on demand.
When you change the filtering in a setpoint, or the Td value of a PID, the setpoint will create only the needed filter stages.

[PR #223](https://github.com/BrewBlox/brewblox-firmware/pull/223)

### Fix fluctuations in mock sensors (firmware)

For testing, you can add periodic fluctuations in a simulated mock sensor.
I fixed some bugs and they now work as expected.

[PR #224](https://github.com/BrewBlox/brewblox-firmware/pull/224) and [PR #218](https://github.com/BrewBlox/brewblox-firmware/pull/218)

### Other changes

- (feature) Added indicator icons for connection type (wifi | usb | simulation) in sidebar.
- (feature) UI temperature units and display settings units are now settable in the same dialog. The dialog can be accessed from both the Display Settings block and the service actions.
- (removed) Dropped support for Kelvin temperature units.
- (removed) Time and LongTime units are no longer configurable.
- (improve) Made Quick Actions editor less cluttered.
- (fix) Fixed a bug where PID settings were not correctly editable in Quick Actions.
- (feature) Setpoint Profile profiles now support import/export from and to file.
- (feature) Quickstart wizards in simulation services now offer to create mock sensors.

## Brewblox release 2020/04/21

**Firmware release date: 2020/04/20**

The previous release brought multiple firmware issues to light.
We hotfixed some of them immediately, and then started work on the others.
This release includes fixes for a few nasty out-of-memory errors that would manifest as sudden reboots.

In the UI, we focused on improving usability.
This includes fixes for scenarios such as:

- "I don't see any dashboards or services" (show notification while waiting for datastore, automatically reload page when available)
- "Controller out of memory in Quickstart wizard" (prompt if existing control blocks are found on controller)
- "I picked the wrong sensor in Quickstart" (swap addresses of sensor blocks)

For the majority of changes, we'd be happy if nobody notices them, and they Just Work.

We also added the L-Valve Builder part.

**Changes**

- (fix) The outOfMemory handler in the firmware could cause a crash.
- (fix) Reduced firmware memory use to avoid crashes in listening mode.
- (fix) Removed firmware lock on serial connection to avoid crash in listening mode.
- (fix) Controller now reboots after listening mode.
- (fix) Reduced connection timeout in firmware.
- (feature) Instructions are now shown on LCD screen during listening mode.
- (feature) Memory use is now shown on LCD screen.
- (feature) Added eeprom dump command, for use in brewblox-ctl. This allows detailed export of persistent data for debugging purposes.
- (fix) PWM now keeps better track of state history. This prevents incorrect jumps after a period of steady state.
- (fix) PWM will now only stretch periods after a normal-length period.
- (improve) Docker volumes are now also pruned during updates.
- (improve) Added the `--ignore-spark-error` flag to brewblox-ctl backup save. If set, the update will continue if it encounters an unreachable Spark service.
- (feature) Added the `brewblox-ctl disable-ipv6` command. Having IPv6 enabled on the Pi can cause interrupts for all services whenever a service restarts. If your Spark service is frequently unreachable without the controller restarting, you can run this.
- (improve) Reduced UI memory usage.
- (improve) In the relations diagram, Logic Actuator comparison blocks are now rendered above the Logic Actuator itself. This shows more clearly them being "input" for the Logic Actuator.
- (feature) The Quick Actions widget is now compatible with all Spark services on your system.
- (improve) Show a spinner when busy applying a Quick Action.
- (improve) Show a notification whenever a Quick Action is applied.
- (improve) Refresh all blocks after a Quick Action, to show secondary effects (eg. PID values after changing a Setpoint).
- (improve) Quick Start wizards are now disabled when no Spark service is available.
- (config) Changed the default Ferment fridge Minimum ON constraint from 3 -> 2 minutes.
- (fix) The brewery page no longer potentially references to a property of a removed layout.
- (feature) Sidebar status is now stored in localstorage. It will retain its open/closed status on next visits.
- (feature) The UI now waits for the datastore to be available, and then automatically reloads the page. This prevents mysteriously blank pages just after startup.
- (feature) Added controller reboot action to the Spark service page actions.
- (fix) The actual HTTP errors are shown again in error notifications.
- (feature) Added the L-valve Builder part. The valve can be triggered manually, or linked to a Digital Actuator / Motor Valve.
- (feature) Progress messages are now streamed to the UI during firmware updates.
- (improve) The "Edit start/end" button is now always available for Session Graph Notes.
- (feature) Added a duration preset dropdown for all relevant graphs. This was previously missing for sidebar graphs in dialogs.
- (deprecate) Deprecated the Block Groups feature. It provided a solution to a problem nobody had.
- (deprecate) Removed the Session View widget (the precursor to Session Log). It has been deprecated for 6 months now.
- (feature) Added widget wizards for discovered blocks.
- (feature) Quickstart wizards now check for existing blocks on the controller. If blocks are found, you can choose to keep them or remove them. You still have to remove obsolete dashboards and widgets yourself.
- (fix) Resolved an issue where Builder parts were not draggable in browser fullscreen mode.
- (improve) ENTER / CTRL-ENTER behavior in dialogs now more consistently saves and closes input dialogs.
- (feature) Added OneWire Temp Sensor action to swap addresses with a different sensor. This should help when a sensor is being replaced, or the wrong sensor was chosen during a Quickstart wizard.
- (feature) Added selectors for overriding graph Y ranges (both Y1 and Y2).
- (API) Added "policy" argument to `history/query/last_values` endpoint.
- (fix) Graphs with a start time earlier than 24h ago will now never use the realtime dataset (only kept for 24h).
- (improve) When the service can connect, but does not receive a handshake, the troubleshooter suggests to flash the bootloader.

## Brewblox release 2020/04/06

**Firmware release date: 2020/04/06**

This release includes a collection of quick fixes to problems introduced or uncovered in the previous release.

**Important: we fixed a problem with updating brewblox-ctl. To make use of the fix, please run brewblox-ctl update twice**. The correct version of brewblox-ctl for this release is 0.18.0.

**Changes**

- (fix) The Spark LCD now uses the correct formula for converting Celsius to Fahrenheit.
- (fix) PID integral is now reset Ti is set to 0.
- (fix) Two consecutive operators (`a|&b`) in Logic Actuator now trigger an error result in firmware.
- (improvement) `brewblox-ctl flash` is now faster.
- (improvement) `brewblox-ctl bootloader` no longer requires the --force option.
- (fix) Improved how in-UI firmware updates are handled. This doesn't solve all known issues, but should improve reliability.
- (fix) The update of brewblox-ctl now ignores the local cache. **Please run brewblox-ctl update twice to make use of this fix**.
- (fix) Blocks from all services can now be selected in Builder Setpoint / Sensor display parts.
- (improvement) The Logic Actuator expression field is now more responsive.
- (improvement) The Logic Actuator error display now has a fixed height. Lower-placed elements will now consistently render in the same place.
- (fix) When loading the UI, a notification will appear if the datastore could not yet be reached. It is common for the datastore to be much slower to start up than the UI. This results in a UI without any available dashboards or services.

## Brewblox release 2020/04/02

**Firmware release date: 2020/04/02**

We're happy to announce the release of the Logic Actuator block.
You can use this block to toggle a Digital Actuator based on the state of other Digital Actuator, Motor Valve, Setpoint, or PWM blocks.

To assist with this feature, we also added the Mock Pins block, and constraints for delaying the ON or OFF switch on digital actuators.

A less noticeable change is that we now build all our Docker images to be suitable for both AMD64 desktop computers and the ARM32 Raspberry Pi.

Previously, we prefixed Pi image tags with `rpi-`. This is no longer required.
To prevent breakage, we now tag the universally compatible images both with and without prefix.

This change will make it possible to move your system between a desktop computer and a Pi without having to make any changes to configuration.

**Changes**

- Added *Logic Actuator* block.
- Added *Mock Pins* block.
- Added *Delay ON* and *Delay OFF* digital constraints.
- Made all Docker images multiplatform, removing the need for `rpi-` prefixes.
- Updated Spark system libraries.
- Fixed a bug where controllers would stop being discoverable over Wifi.
- Added support for value fluctuations in Temp Sensor (Mock).
- `brewblox-ctl backup load` now reads the values from the loaded .env file before loading databases and Spark services.
  - You can disable this with the `--no-load-env` option.
- `brewblox-ctl backup load` now restarts Spark services to make sure they use the correct block names.
- `brewblox-ctl setup` now uses a Docker container to generate SSL certificates. The host no longer needs to have OpenSSL installed. This was an issue for installing the system on Mac hosts.
- Fixed a bug where the graph in Setpoint Profile was not updated if the block settings where changed in a different widget.
- The firmware simulator is now embedded in the Spark service Docker image. This is a first step towards having a demo setup that does not need a controller. For now this only works on amd64 (desktop) computers. We're still working on getting the firmware to compile an ARM simulator.
- Fixed a bug where DS2408 / DS2413 chips could not be removed in the UI.

## Brewblox release 2020/03/18

**Firmware release date: 2020/03/02**

**Changes**

- Added the `Brewery` page mode, for full-screen display of a single Builder layout.
- Added [documentation page](https://brewblox.netlify.com/user/all_widgets) describing all widget types.
- Added [documentation page](https://brewblox.netlify.com/user/all_blocks) describing all block types.
- Timeout values for Spark services are now configurable in docker-compose.yml.
- Refactored part settings dialogs in Builder.
- Fixed a bug where no block was selectable as link in the Temp Sensor part.
- Fixed a bug where a disabled PWM pump part was still animated.
- Decreased minimum Builder layout size to 1x1.

## Brewblox release 2020/03/05

**Firmware release date: 2020/03/02**

This is a smaller release to fix some issues that popped up after the 2020/03/02 release.

A new feature is that now block widgets can easily be added to the Spark LCD screen.
Quick start wizards will also try and add generated PIDs to the display.

**Changes**

- Quick start wizards now try to add their PID blocks to the display.
- Added the "Add to Spark display" action to sensors, setpoints, PWM, and PID blocks. This will attempt to add the block to an available slot on the Spark LCD, and open the display settings in a dialog.
- The .env file is now included in backups.
- Fixed a bug where the wrong actuators would be listed in the text file created during the `Remove all blocks` action.
- Exporting actuator / sensor links is now also available as separate action.
- Fixed a bug in the Glycol wizard where the backend would interpret a time value as the Planck constant.
- The Spark service now uses a 60s timeout instead of a fixed number of retry attempts before it restarts.
- `docker-compose.shared.yml` is now always copied from defaults during updates
  - If you need to make changes to shared services, you can do so in docker-compose.yml

## Brewblox release 2020/03/02

**Firmware release date: 2020/03/02**

This release includes fixes for two very important bugs.

The controller needed a reboot when losing and regaining connection to Wifi. Many Spark controllers are placed in basements or sheds where reception is patchy, making this a very serious issue.
We're reasonably certain we fixed this particular bug, but please let us know if you continue to have connection issues.

The second issue is not as common, but no less serious. It was possible for actuators with mutex constraints to enter a deadlock if a DS2413/DS2408 device disconnected and reconnected at the wrong time.

To solve this, we reworked how constraints interact with the mutex. This includes constraints now having their own setting for the extra lock time (the time between an actuator turning off, and the next actuator being allowed to turn on).
To not break current configurations, the mutex will still have its own setting, which will be treated as a default value. The setting in the constraint overrides the one in the mutex.

**Changes**

- Fixed a bug where the controller could not be discovered over Wifi after a network or router reset.
- Fixed a bug where the controller could not be connected to over Wifi after a network or router reset.
- The service will now restart and reconnect after multiple controller messages failed to send.
- Fixed a bug where the controller losing connection to a DS2413 actuator could cause a mutex deadlock.
- Mutex constraints for digital actuators can now override the extra lock time setting in the Mutex.
  - The extra lock time is the minimum time between an actuator turning off, and a different actuator being allowed to turn on.
- Updated docker-compose.yml version to 3.7.
- Fixed a bug where the sensor display builder part was showing its value twice.
- Made boil mode less prominent in the PID.
  - The "boil" text is hidden if the minimum boiling output is not set.
  - Boil mode settings are moved to below the PID calculation display.
- Fixed a bug where additional fields were not shown in OneWire Temp Sensor full mode.
- Streamlined wizards.
  - Options are now shown as clickable items.
  - Single click to toggle selection, double click to immediately continue.
- The block name field is automatically filled with a suggestion when selecting an item in the block wizard.
- You can now double click on dashboards to open the widget wizard.
- You can now double click on the spark service page to open the block wizard.
- Removed the menu for creating mock blocks - the block wizard is sufficiently efficient for quickly and often creating mocks.
- Fixed a bug where the dashboard graph would not update when its configuration was changed in a dialog.
- `brewblox-ctl install` now runs commands after all prompts are done. You shouldn't need to babysit a process that can take 10+ minutes.
- Added a user guide for the basic concepts of the Brewery Builder.
- Moved the layout selector in the Builder editor from the toolbar to the sidebar.

## Brewblox release 2020/02/12

**Firmware release date: 2020/01/17**

During development of the new website, we discovered the existence of a whole spectrum of colors not called `$dark`, `$dark_darker`, `$dark_bright`, or `$darkish`. We sprinkled some of them over the UI and brewblox-ctl.

As a happy side effect of implementing the automation service, we added auto discovery of Spark services. Any active Spark service in your docker-compose network will automatically show up in the UI sidebar. Click on it to add it as UI service.

Brewblox-ctl has been made significantly less spammy. You are still prompted at the start of commands (and can still disable that), but it now offers to do a dry run.

Dry running a command will print all shell commands / config changes to the terminal instead of executing them.
If you enable verbose mode, it will both print and execute.

**Changes**

- Implemented new color palette in UI.
- Reworked widget styling.
- Reworked widget/dialog toolbars.
  - Click the toolbar to edit widget title / block name / service title.
- Improved scroll behavior and styling.
- Improved wrapping behavior in small widgets.
- Spark services are automatically discovered.
- A green/yellow/red indicator for service status is shown in the sidebar.
- Removed service wizards.
- (Developers): Significant changes to interfaces used by plugins.
  - See brewblox-plugin for descriptions and examples.
- Unpinned widgets no longer jump when being resized.
- Reworked brewblox-ctl to add more options, and reduce spam.
- Added --quiet, --verbose, and --dry-run flags to brewblox-ctl.
- Use the `--dry-run` option, or answer `d` / `dry-run` in a prompt to have the command print its actions instead of executing them.
- Added env commands to brewblox-ctl to list/get/set values in .env.
- Moved `brewblox-ctl save-backup` to `brewblox-ctl backup save`.
- Added `brewblox-ctl backup load`.
- Moved `brewblox-ctl editor` and `brewblox-ctl ports` to the `brewblox-ctl service` group.
- Added `brewblox-ctl service remove` and `brewblox-ctl service show`.
- Added `brewblox-ctl follow` to see service logs.
- Added help texts throughout brewblox-ctl.
- `brewblox-ctl service editor` will now show an address you can directly copy to your browser to visit the editor GUI.

## Brewblox release 2020/01/20

**Firmware release date: 2020/01/17**

This release, we're happy to introduce the new Brewblox logo.

We've also fixed some longstanding bugs in how Safari displays Builder layouts.

**Changes**

- Added the new Brewblox logo.
  - This is displayed in the UI, and on the Spark boot screen.
- Firmware build date is now displayed on the Spark boot screen.
- Added the `brewblox-ctl save-backup` command.
  - This creates a zip file in `brewblox/backup/` with datastore and Spark export files.
  - We will soon add the corresponding `load-backup` command.
- Fixed a bug in history where the wrong dataset was displayed in graphs for data with a very low update rate.
- Fixed Builder icons being displayed in the top left in Webkit browsers (Safari).
- Added an overview of previous notifications.
  - This can be accessed by clicking the bell icon in the bottom right of the UI.
- A warning is now shown if the flow calculation in Builder exited early due to an overly complex layout.
- Updated the icon used for heating PIDs in the Builder.
- Dashboard / service / layout title is now shown as page title in the browser.

## Brewblox release 2020/01/02

**Firmware release date: 2019/12/24**

First of all: happy new year everyone!

As of this release, we officially support mobile devices.
This update fixes the UI elements we identified as being broken on small screens. Any newly reported issues will be treated as bugs, and given due priority.

One exception is the Builder Editor. While technically it now works on mobile, it's pretty much unusable. For this reason, we've hidden UI links to the editor on small screens.
Builder widgets in dashboards are still shown, and now automatically resize the layout to fit the widget/screen.

**Changes**

- The UI automatically switches to mobile mode if the screen is less than 1000px wide.
  - This applies both when opening the UI on a small device, or resizing the browser window.
- In mobile mode, some elements behave differently:
  - Widget/wizard dialogs are always maximized.
  - Dashboards are rendered as list.
  - In the Spark service page, only the block index is shown. Clicking on it will open the block in a dialog.
  - Graphs are given a fixed height to prevent rendering issues.
  - The Builder editor is hidden.
- Fixed a lot of issues with elements not scrolling correctly.
- The displayed layout in the builder widget now automatically resizes to match the widget.
  - To fix alignment issues in your layout, adjust the grid size in the builder editor.
  - We updated the default grid size for layouts generated in Quick Start wizards.
- Redesigned toolbar buttons on dashboard and service pages.
- Graphs now consistently re-render when widget is resized due to:
  - window resize
  - sidebar open/close
  - device rotation
- Fixed double display of "this PID is disabled" warning in full PID widget.
- Fixed warnings in Setpoint Profile having a lighter background color.
- Fixed varying widget widths in the Spark service page.
- Placed index buttons for dashboard/builder/wizard in the sidebar
- Builder editor is now implemented as a page, and not a dialog.
- Redesigned/moved the sidebar buttons for navigating to dashboards/builder/wizards.
- Added option in the builder sidebar to prevent the "Click to resume editing" warning.
  - You still need to refocus the screen before you can use shortcuts.
- Added a layout selection menu to the Builder widget toolbar.
  - This includes a dropdown with all known layouts, and a list with starred layouts.
  - You can star/unstar layouts in the dropdown.
- Removed "full" version of the Builder widget (made redundant by the layout selection menu).
- Reduced timeout in service <-> controller communication to prevent reboots caused by dropped messages.

## Brewblox release 2019/12/23

**Firmware release date: 2019/12/17**

**Changes**

- Added annotations for graphs in session log
  - Open the graph and click on a line to add/edit an annotation
  - You may have to open/close the graph before the annotation shows. This will be fixed soon.
- Updated system layer in firmware.
- Fixed a bug in how spark pins are claimed / released.
- Fixed a bug in how graph notes are exported in session log
- Fixed a bug in build where source parts would disappear while dragging to copy parts
- Fixed a bug in builder where flow was calculated incorrectly if there were multiple parallel pumps

## Brewblox release 2019/12/17

**Firmware release date: 2019/12/03**

**Changes**

- Fixed a bug where device ID checks during discovery and handshakes were case sensitive.
- Added automated migration from Session View sessions to Session Log sessions.
- Added functionality to export/import a single block.
  - This is only useful in very specific scenarios, as the exported block includes links.
- Plotly graphs are now exported in higher resolution.
  - To export a graph, mouseover the graph, and click the camera button.
- Reworked the buttons in the widget toolbar to be more consistent.
  - In widget, from left to right:
    - toggle between full/basic view
    - open widget in dialog
    - show menu
  - in dialog, from left to right:
    - toggle between full/basic view
    - show menu
    - close dialog
- Reworked the widget dropdown menu. It now shows all items in multiple columns.
- Removed multiple redundant or obsolete actions from widget menus.
- Fixed a bug in quick start wizards where editing the prefix could cause the application to freeze.
- Fixed a bug in the graph settings where the tree would not correctly expand when searching.
- Fixed a bug in the graph settings where you could not tick fields while searching.
- In the builder, when clicking a heating element that is driven by a PID, it will open the PID dialog.
- Setpoint setting is now directly editable in the PID widget (both in basic, and full view).

## Brewblox release 2019/12/06

**Firmware release date: 2019/12/03**

A smaller release again, with some fixed bugs, and a handful of display improvements.

To make it easier to find sessions, they can now have tags. When selecting sessions you can search to filter by name, date, or tag.

**Changes**

- Added tags to Session Log sessions
- You can now close the current session in Session log to return to initial state (no selected session)
- PWM/PID displays in builder are now postfixed with `%`/`°C`.
  - Support for Fahrenheit when the PID is using a Setpoint Driver is still on the backlog.
- PID displays in builder now display a different icon (`±`) when driving a Setpoint Driver.
- Fixed a bug in quick actions where the change editor would close every time blocks were refreshed.
- Fixed a bug where the side graph in a block dialog would exit and not resume when the full-screen graph was opened.
- Fixed a bug where side graphs would not resize when basic/full mode was toggled in a block dialog.
- Added help text to `discover` and `add-spark` commands
- The plaato service now has an install script.
  - <https://github.com/Brewblox/brewblox-plaato>
- `brewblox-ctl update` will prompt for pruning images at the start, not halfway in.
  - Due to how brewblox-ctl updates itself, this will take effect in the next update.
- Improved rendering when there is a large number of dashboards.
  - Dashboards will no longer scroll in front of the bottom buttons in the sidebar
  - In wizards, a dropdown will be shown if there is a large number of dashboard options.

## Brewblox release 2019/12/03

**Firmware release date: 2019/12/03**

While the initial installation by now is pretty smooth, editing `docker-compose.yml` has a steeper learning curve.

To counteract this we moved some configuration, and added two commands to brewblox-ctl: `discover` and `add-spark`.

`brewblox-ctl discover` scans USB/Wifi for devices, and will print the ones it found.

Example:

```sh
pi@fridgepi:~/brewblox $ brewblox-ctl discover
usb 280038000847343337373738 Photon
wifi 280038000847343337373738 192.168.0.57 8332
wifi 240024000451353432383931 192.168.0.86 8332
```

`brewblox-ctl add-spark` will create a new Spark service in `docker-compose.yml`.
It accepts multiple arguments, some mandatory, some optional.

For reference, see the updated docs for adding a spark and connection settings.
Example call:

```sh
steersbob@BrewBox:~/brewblox$ brewblox-ctl add-spark
How do you want to call this service? The name must be unique: new-spark
Discovering devices...
device 1 :: wifi 280038000847343337373738 192.168.0.57 8332
device 2 :: wifi 240024000451353432383931 192.168.0.86 8332


Which device do you want to use? [press ENTER for default value '1']2

Added Spark service "new-spark".
You can now add it as service in the UI.
```

For those cases when `docker-compose.yml` still needs to be changed, we moved the system services to `docker-compose.shared.yml`, to reduce cognitive load when editing.

**Changes**

- Added `brewblox-ctl discover`
- Added `brewblox-ctl add-spark`
- Moved system services to their own file (`docker-compose.shared.yml`)
- Added / updated documentation for adding and using multiple services
- The `--device-id` flag in the Spark service configuration is now checked when connecting to a controlller.
  - This allows it to be used in combination with `--device-host`.
- Prettified Quick Actions editor
- Fixed a bug in glycol wizard actions

## Brewblox release 2019/11/21

**Firmware release date: 2019/11/12**

Instead of releasing a big new feature, we took the time to polish and refactor multiple smaller UI components.

We made a lot of small tweaks to the Session Log widget, and to many input components throughout the UI.

**Changes**

- Multiple small improvements to the Session Log widget.
  - `Insert date` now inserts at the current cursor position, not always at the end of the note.
  - Creating a new Session now spawns a dialog where you can pick the session name, and choose from which other session to import notes.
  - Drag to resize notes when editing the Session Log (cogwheel button).
  - Render content of text notes to reduce layout "jumps" when toggling between basic and full mode.
- Deprecated the Session View widget.
- Improved display of editable fields (no more underlined text, but something that looks like an input field).
- Next to presets, you can also pick a custom duration in the graph toolbar.
- Auto-fill SSL cert questions in `brewblox-ctl setup`
- Fixed an error that caused the PWM pump in the builder to not respond to clicks.
- Display warning icon if a PWM/PID itself is disabled in the builder.
  - Recommended way to disable a control chain is to disable the setpoint.
- Builder editor remembers the active layout.
- Setpoint profile will now offer to insert a new point when making any change that will cause the current temperature setting to jump.
  - Previously, this only happened when changing the temperature of the last or next point.
  - Now it will also happen when editing the time.

## Brewblox release 2019/11/12

**Firmware release date: 2019/11/12**

*Firmware stability and calendar time*

Multiple users were suffering from crashes and hangups most likely caused by bugs in the Wifi system layer.
This release includes a system layer update from particle that that should fix many of these issues.

The Spark now also receives the current time if it connects to the Spark cloud. So if the brewblox service on the pi down, it can still track profiles.
If no cloud connection is used or the Sprak does not have WiFi, it will be able to restore the last system time it recieved from the service from backup memory.
This means that the system time will only be lost on a power cycle. When using only USB, the service swill still set the time.

These changes also mean that the time cannot overflow anymore and long running profiles are not a problem.

*Graph configruation*

We reworked yet another configuration screen. This time it's selection of history fields (`Graph`, `Metrics`, `Session View`).

The Graph configuration suffered from being overly detailed.
The history service has no notion of blocks, and allows every individual field to be selected. This requires users to make very fine-grained decisions when selecting data to show.
Settings were also very spread out: adding a single field might require using 3 out of 4 tabs in the settings.

To improve visibility we removed the tabbed layout, and merged the settings in the field tree.
You can now click on nodes to edit their display settings.

*New Widget: Session Log*

We added a new widget: the `Session Log`. The goal of this widget is to write down things during a brew day: when did things happen? What was the start SG?
You can export this to printable HTML. It is also the easiest place to keep graphs of sessions, because it has a start and stop button.

The Session Log allows creating a template for your brew day / batch notes.
In the basic view, you can click on a note to edit its value without changing the template settings.
When starting a new session, it will automatically copy the template from the current opened session.

The session consists of a number of notes. You can edit the title and display width for each note in the Full view of the Session log widget.

- `Text notes` are multiline editable fields. There's a button for adding a timestamp, to make it easy to use for logging purposes.
- `Graph notes` have two sets of configuration.
  - You configure the graph fields while creating the template.
  - You can import fields from Graph widgets, or other graph notes.
  - During the brew day you click on the note to show the graph, or start and stop the period.

You can export sessions to a simple HTML file. Any [markdown](https://dillinger.io/) syntax in text notes will be rendered.

We think that Session Log is a sufficiently big improvement over the Session View widget that it can completely replace it. If feedback is positive, we'll likely deprecate and eventually remove the Session View widget.

**Changes**

- Updated Spark system software.
  - This fixes multiple bugs that caused crashes or boot loops.
- Reworked the settings component for selecting history data (used in Graph, Metrics, Session View, Session Log)
- Add `Session Log` widget and builder part.
- Tweaked the sidebar layout to remove visual clutter.
- Renamed the `Step View` widget to `Quick Actions`.
- Remove prompt to locally preview `brewblox-ctl log`.
- Fixed a bug where invalid pin assignment would crash generation of the link file when clearing Spark blocks.
- Setpoints now show the enable/disable toggle in the basic display.
- Import graph settings when starting a new session in `Session View`
- Improved Dashboard wizard.
  - ID/URL is now automatically suggested based on chosen title.
- Block dialogs opened by clicking a relation diagram will now initially show the basic display.

## Brewblox release 2019/10/17

**Firmware release date: 2019/10/14**

The Builder editor was functional, but somewhat clunky at times.
We often saw users being surprised by what happened when they clicked in the grid, because they didn't realise they still had a specific tool active.

To combat this, we split the tools between `modes`, and `tools`.

`modes` function like tools used to: a persistent mode that determines what happens when you click or drag in the grid.

- `Select`: click or drag to select or unselect part. (No changes here).
- `Interact`: click on parts to interact with them - this toggles valves or opens block dialogs. (No changes here either).

`tools` are now immediate actions that modify parts that are currently selected or under the cursor.
You can trigger a tool by either selecting the target parts and clicking on the button, or selecting/hovering target parts and using the keyboard shortcut.

- `New`: immediately opens the block catalog. After selecting a part in the catalog, click in the grid to place it.
- `Move`: selected or hovered parts are attached to the cursor. Click in the grid to place them.
- `Copy`: same as `Move`, except that parts are copied.
- `Rotate`: floating, selected or hovered part is rotated 90 degrees clockwise. (Does nothing if multiple parts are selected.)
- `Flip`: floating, selected or hovered part is flipped. (Does nothing if multiple parts are selected.)
- `Edit Settings`: opens part settings for selected or hovered part. (Does nothing if multiple parts are selected.)
- `Interact`: interacts with selected or hovered part. (Does nothing if multiple parts are selected.)
- `Delete`: removes selected or hovered parts.

On the whole, this should offer a smoother and more intuitive editing experience.

**Changes**

- Overhauled Builder editor tools.
  - Split tools in `modes` and `tools` (described above).
  - Automatically detect when the editor loses focus, to clearly display when keyboard shortcuts won't register.
  - Added `redo` button.
  - `undo` and `redo` are now triggered by `ctrl+Z` / `ctrl+Y`.
  - Moved the layout actions and selector to the toolbar.
- Renamed many builder parts to follow a common convention, and allow sensible grouping when sorted.
- Added the `Label: text` part to go along with `Label: URL` (previously `Url Display`).
- Simplified the naming task in Quick Start wizards. Now it just asks to pick a prefix and a dashboard name.
- Quick Start wizards now always create a new dashboard.
- Added a toggle to the Spark service page, to show blocks either in a list (previous behaviour), or in a relations diagram.
- Added a build date to the debug menu in the sidebar, to help identify the currently installed release.
- When visiting the Spark IP in the browser, it now also shows its unique device ID. This should make it easier to setup a configuration that uses multiple Sparks connected over Wifi.
- Fixed a bug in the Glycol wizard that would not allow the user to create a configuration without a glycol sensor.

## Brewblox release 2019/10/10

**Firmware release date: 2019/09/16**

We're happy with how we can open a block in a dialog from anywhere in the UI, but there were some drawbacks.
Most notably, dialogs always used the (more extensive) settings component.

To fix this, we reworked how widgets are rendered. Most widgets can now easily toggle between simple and full modes, both when displayed on a dashboard, and in a dialog.
Toolbar buttons have been tweaked to make accessing settings smoother.

In the coming weeks, we will be reviewing all widgets.

- The basic view is for day-to-day use: settings and values that you want to see during a brew day.
- The full view is for configuration: setting up and tuning your system.

While we were at it, we also improved the Spark service page. The index and the widgets now scroll independently.
When selecting a widget in the index, the displayed widget will automatically scroll in view.

**Changes**

- All widgets can now toggle between Basic and Full mode
  - The settings button on the widget toolbar will now toggle the widget to Full.
  - Clicking the settings button again will open the settings in a dialog.
- Improved the Spark service page.
  - The index and widgets are now elements that scroll separately.
  - Click on an element in the index to make it visible in the right-hand scroll area.
  - Click the check button on the left to collapse the widget - it will no longer be shown on the right.
- Blocks without links are now shown in the Spark relations diagram.
- Builder parts with links now display a warning if they have a broken link.
- Fixed a bug in Setpoint Profile where the Graph would not resize after a warning disappeared.
- Added an express mode to `brewblox-ctl install`. This will install with default settings, and disable the `the following commands will be used` prompt.
- Improved wording in brewblox-ctl prompts to clarify that immediately pressing enter will choose the default value.
- Added a button to switch the Block in a Step View change while keeping the changed fields.
- Added an option to restore names of discovered blocks when removing all blocks in the Spark Service page.
  - This is useful for resetting your system without having to figure out the physical position of `New|TempSensorOneWire-1` again.
  - The following types can be restored: `OneWire Temp Sensor`, `DS2408`, `DS2413`.
- Added an option to save a text file with hardware links when removing all blocks in the Spark Service page.
  - This can serve as reminder which pins were used by which actuator.
- Fixed a bug that incorrectly marked some Step View steps as not active if they contained PID setting changes.
- Shuffled some items in the sidebar.
  - Added a quick button for the Builder Editor.
  - Moved the dashboards and services up, and placed the Quick Start and Builder Editor items below them.
  - Placed the plugins button at the bottom, next to the debug button.
- Added a button in the Builder Editor to create a widget showing the current layout.

## Brewblox release 2019/10/01

**Firmware release date: 2019/09/16**

So far, we like how quick start wizards simplify the setup process.
We intend to have a wizard for all commonly used setups.
Feel free to make a request if you have or want a specific setup!

We added two this release:

**RIMS Brew-in-a-Bag** uses a single kettle and a RIMS tube.

**Glycol Fermentation** generates a fermentation setup where cooling is done by pumping glycol through a coil.

- Added `RIMS Brew-in-a-Bag` and `Glycol Fermentation` quick start wizards.
- You can now export graph data to CSV from the Graph widget actions.
  - This will use the currently displayed time span, but always choose high precision data.
- You can now save and load stored profiles in `Setpoint Profile`.
  - Profiles are stored globally, and can be used in all your Setpoint Profiles.
  - When loading a saved profile, the Setpoint Profile keeps its current target.
  - Profile points are relative to the start time. When loading a profile you can choose to set start time to now.
- Fixed a bug that significantly increased the UI size. Page load should now be noticeably faster.
- `brewblox-ctl update` now asks to prune docker images to clean up disk space.
- Added builder parts:
  - Gravity tube (simulates height differences in your layout by increasing flow speed).
  - RIMS tube
  - PWM display part (shows the same values as the `Heating Element` part)
- The liquid level in Kettles is now editable. This is a cosmetic change: flow calculations treat every kettle as completely full.
- Settings in quickstart wizards are now remembered if you go back in the wizard.
- Setpoint displays in the builder can now be placed inline in tubes.
  - Each edge is connected to all other edges.

## Brewblox release 2019/09/12

**Firmware release date: 2019/09/12**

There is now a wizard for a HERMS configuration. To go along with this, we reworked the flow calculations to also consider kettles. This has been a pretty big rewrite, and we'll be adding fixes for some edge cases in the coming weeks.

If you have a layout where flows are suddenly going the wrong way, please let us know.

We did rename "arrangement" to "Quick Start", to better communicate the use case behind the wizard.

Because we're making more and more use of the setting popup components, we added a pull-out tab for graphs.
This includes the Graph widget, but also various blocks, and the Setpoint Profile.
The intention is that you can now easily access graphs, even if you opened the settings from a Builder layout or relations diagram.

This is part of the ongoing approach to reduce the number of elements initially visible, while making it easy to navigate between related blocks and widgets.

As it's a relevant feature for HERMS, we added Boil Mode support to the PID. When the setpoint is higher than a configurable value (default 100 celsius or equivalent), the integrator is disabled. A minimum output during boil mode can also be set.

**Changes**

- Renamed "Arrangement" to Quick Start.
- Added HERMS Quick Start wizard.
- Reworked flow calculations.
  - Flow calculations now include kettles (no more need for the SystemIO workaround).
  - Calculations are significantly faster.
  - Increased default pressure for System IOs and pumps (flows go faster).
- All blocks with graphs can now display them inline in their settings menu.
- Changed some builder components.
  - Added a Setpoint Profile part.
  - The Heating Element part in the Builder can now be resized.
  - System IO/Pump pressure is now configurable in part settings.
  - Condensed service/block link selector into a single select that shows all blocks on all spark services.
  - You can now use a color picker and preset colors in both containers (Kettle, Carboy, Bottle), and System IO parts.
  - The PID display part now shows output setting. If output value is 0, the icon color turns white instead of red/blue.
- Fixed a firmware crash if the Balancer tried to remove a non-existent ID.
- The Web Editor for the configuration file now continuously checks whether the server is still online.
- Display current status and values for pin/sensor options in quick start wizards.
- Fixed a bug where the Step View would fail to update PID Kp settings.
- Fixed a bug where the Step View would consider time durations such as "1h" and "60m" as not equal.
- Fixed a bug where the relations diagram would not render correctly in Firefox.
- PIDs are now configured differently for fridge and beer modes.
  - Changed the default settings when generated through a quick start wizard.
  - Changing beer <-> fridge constant mode will also change the PID settings. This is prompted to avoid silently overwriting user settings.
  - Fixed PID presets, and added new ones.
- In the Setpoint Profile, if you change the upcoming point, it will offer to splice the profile.
  - This will generate a point at the current time and temperature setting.
  - This avoids immediate jumps in temperature setting - it will calculate the line from the current setting to the next point instead of from the previous point to the next point.
- Fixed a bug where zoom level would be reset when a graph received a data update.
- Improved the tooltip when constraints are configured, but none are currently limiting the value.
- Improved explanatory text in Wizardry.
- Fixed a bug in Quick Start wizards where repeatedly going back and forth between steps would exit the wizard.
- Tweaked the theme colors. Toolbars are now less prominent.
- The PID now supports Boil Mode.
- Improved the toggle button for changing dashboard edit mode.

## Brewblox release 2019/08/22

**Firmware release date: 2019/08/20**

To make it easier to edit the configuration, we added a web-based editor for the `docker-compose.yml` file.
You can start it by running `brewblox-ctl editor`, and visiting the Pi IP at port 8300.

To avoid redirection issues we've moved the UI to the `/ui/` subdirectory. If you navigate to `https://PI_ADDRESS` you'll be automatically redirected. This fixes multiple issues with accessing the datastore on startup.

**Changes**

- Added the `editor` command to brewblox-ctl.
- Moved UI address root from `/` to `/ui`.
- Pinned Docker image versions for external services (datastore, influx, and traefik).
- Fixed erronous period stretching in the firmware when PWM duty goes over 50%.
- Added `?safe` URL parameter to disable loading remote plugins.
  - This allows removing plugins that prevent the UI from rendering.
- Improved the Step view diff tooltip.
  - Actuator state is now printed as `Active`,`Inactive`,`Unknown` instead of a number.
  - Changed values are now rendered with old values in red, and new values in green.
  - Unchanged values are now rendered as a single value, instead of `old => new`.
- Fixed a bug in Builder where a new part would be placed at an incorrect location.
- Disabled the Editor button in IE/Edge browsers due to a breaking bug.
- Improved help texts in the Builder settings screen.
- Third-party plugins can now register Builder parts.
  - We'll be working to allow third-party plugins to acces helper functions.
- Fixed a bug where the UI would return a 200 status code for `/datastore` and `/history` endpoints if the datastore/history service is not (yet) online.
- Fixed a bug where changing duration in a Block graph would not re-render the graph.

## Brewblox release 2019/08/12

**Firmware release date: 2019/08/06**

No dramatic new features this week, just a steady stream of iterative improvements.

**Changes**

- Added two oft-requested features to the Step View widget:
  - The Step tooltip in the widget now shows a detailed overview of the changes that would be applied (current => new).
  - In the settings popup, Steps and Step Changes can now be dragged to change their order.
- Refactored the Graph settings popup.
  - It now uses tabs instead of expansion items.
  - There's a combined display settings tab. Y-axis and line color settings are placed here, with room for future settings.
  - Added help text clarifying that only fields updated the last 24h are shown, and that this will include renamed or deleted fields.
  - Added help text explaining averaging periods.
- In the Builder Widget, tweaked the Select tool
  - You can now drag to add more parts to the current selection. (Previously it would clear current selection)
  - Flow is now correctly updated for currently selected parts after dragging them.
- The UI is now more responsive while calculating flows.
- Fixed a bug in the Step View widget where it would use the wrong field for PWM/Setpoint Driver setting.
- When using `brewblox-ctl log`, blocks from the default `spark-one` service are added to the output.
  - We're still working on automatically detecting all active Spark servies.

## Brewblox release 2019/08/07

**Firmware release date: 2019/08/06**

The UI now supports third-party plugins. If you want to add your own custom widgets, you can now do so.
We created the example repository <https://github.com/Brewblox/brewblox-plugin> to get developers started.

**Changes**

- Added the plugin menu to the sidebar.
  - Plugins are loaded from an URL, and require a page reload to activate.
  - If a plugin failed to load, an error is shown here.
- Fixed a bug where fast PWM mode failed to activate (Spark pins automatically switch to 100Hz mode when PWM period is set to < 1s)
- Fixed a bug where you could not select a different service in the Fridge arrangement wizard.

## Brewblox release 2019/07/30

**Firmware release date: 2019/07/25**

This release is all about the UI. We implemented a handful of feature requests, and did some additional tinkering on the Brewery Builder.

We like where the Builder is headed in terms of features, but performance is becoming an issue. We'll likely re-evaluate the flow calculations soon, to make everything much more snappy.

**Changes**

- Added a warning to the Motor Valve widget when 12V is disabled (Spark 3 only).
  - You can also toggle this in the Spark Pins widget.
  - 12V is disabled by default, to prevent accidental damage to 5V peripherals.
- You can now select multiple parts in the Brewery Builder.
  - Drag to select in a square.
  - Click on a part to select/unselect it.
  - Click on the grid to unselect all.
  - Selected parts can be copied/moved/removed using the respective tools.
- Added Undo button to the Brewery Builder.
  - Changes to the currently open layout are tracked.
  - Removed an earlier change where the delete tool would not be persisted.
- The center shelf position in the Fridge Part is now configurable.
- In the Builder Editor, moved the coordinate numbers from individual parts to the left and top edges of the grid.
- Fixed a graphical bug in toolbars where title text would overflow.
- Widget warnings now have a max width.
  - This prevents widgets in the service page suddenly all becoming much wider.
- Constraints now show a separate message if no constraints are configured.
  - "Not limited" is still shown if constraints are configured, but not limiting.
- When editing dashboard IDs, the ID is now validated to prevent unreachable URLs.
- Default labels in the Graph and Metrics widgets are now prettified.
  - `spark/sensor-1/value[degC]` becomes `sensor-1 value °C`.
  - You can still edit labels to give them custom names.
- In the Graph widget, line colors are now editable.
- Objects in the relation diagram now have a hover effect.
  - This should increase visibility that they are clickable.
- Made block warnings more consistent.
  - A warning is now also shown if the target is not set (eg. PID is not driving anything).

## Brewblox release 2019/07/23

**Firmware release date: 2019/07/23**

We're pushing some fixes in firmware, and the first of some new features in the Builder widget.

When brewing, processes often require physical changes to your layout (eg. when using detachable hoses).
This can't be easily expressed in a single Builder, so we added the ability to quickly switch between layouts.

**Changes**

- Introducing Layouts in the Builder widget.
  - Layouts are collections of parts, and are kept globally.
  - Each Builder can select one or more Layouts, and change between them like a slide show.
  - The Builder editor can toggle between all available Layouts.
  - Existing configurations are automatically migrated to a new Layout.
- Made multiple improvements to the reliability of runtime firmware updates.
  - Some of them are firmware-side, so you'll only notice them during the next update.
  - Changed the LED color during runtime firmware updates from orange to purple.
  - Now immediately throws an error if you try to update while the service is not connected.
- Fixed a bug where Digital Actuators would lose the link to the pin channel after a reboot.
- A retry is scheduled when connection is lost to a Spark service.
  - If the retry restores connection, the notification will be automatically closed.

## Brewblox release 2019/07/18

**Firmware release date: 2019/07/17**

Due to Elco's upcoming holiday, we decided to push some firmware changes now. This leaves us time to fix any
critical issues while he's still here.

This release does include a pretty exciting change: we can now update firmware over Wifi! You can even run it from the UI, without having to restart your services.

### IMPORTANT: If you skipped the last update, you'll need to run `brewblox-ctl flash` to enable updates in the UI

The new mechanism is experimental, and may require a retry before it works. There are multiple checks in place to ensure that if an update fails halfway, the current firmware is not corrupted.

**Changes**

- When the PWM setting is less than 5%, its actuator will not be listed as waiting for the Mutex.
  - This is mostly a cosmetic change, to prevent actuators visibly waiting for the Mutex because the PWM setting (briefly) jumped to 0.0001.
- Fixed a bug where errors in the OneWire bus would cause the Spark to be stuck after rebooting.
- Enabled flashing the firmware in the UI. It can be accessed from the actions button in the Spark service page.
  - This is available for both USB and Wifi connections, and does not require other controllers to be unplugged.
  - `brewblox-ctl flash` is still available.
  - If you're updating from an older version, you'll have to run `brewblox-ctl flash` to enable this feature.
  - The UI will prompt you to update if an older firmware version is found.
  - `brewblox-ctl update` no longer prompts you to flash the controller.
- Brewery Builder changes:
  - Removed the % sign from the Pid Display part
  - Added the Url Display part. You can use this to easily navigate to local or external links.
  - The fridge wizard adds an Url Display that links to the [fermentation arrangement guide](https://brewblox.netlify.com/user/ferment_guide.html).
  - PWM Display / Heating element parts are now clickable, and open the PWM settings dialog.
  - Pid / PWM displays now show achieved output values.
  - When closing / reopening the Builder editor with the Delete tool selected, the previous tool will be used instead.
  - Added a search field to the part catalog (shown when adding a new part).
- Unit edit dialogs now use a value rounded to 2 decimals.
- Reworked how constraints are displayed.
  - Normally, only the currently limiting constraints are shown.
  - Clicking the field opens an edit dialog.
  - This standardizes how constraints are rendered in widgets and block setting dialogs, and removes the need for an expansion item in setting dialogs.
- Removed expansion items (collapsable subsections) from block settings dialogs.
  - During the last few months, we've moved generic actions and less relevant fields to dialogs and actions. This made the expansion items unnecessary.
- Fixed an issue where API errors would generate useless error messages about commits only being possible in dynamic modules.

## Brewblox release 2019/07/15

**Firmware release date: 2019/07/15**

We've been reconsidering some widget names, as the "XXX View" format has some issues.

The immediate result is that `Process View` is now called `Brewery Builder`. It still works the same, but now has a different subtitle in the widget. Step View will also be renamed, but we're not sure yet how to call it. Feel free to add suggestions!

In the past, we've deprecated multiple types of blocks. This created some leftovers on the Spark that consumed valuable space in memory. Deprecated blocks will now be shown in the UI, where they can be removed.

The service/controller handshake mechanism added a useful version check, but was somewhat unreliable. We've added some fixes here to improve that.

Due to how driven blocks work (eg. a PID driving a PWM), it was possible for PWMs or Digital Actuators to suddenly turn on if the controller rebooted after the PID or Setpoint was disabled. We'd rather not have that, so we fixed it.

**Changes**

- Show deprecated objects.
  - This allows you to clear space on the controller.
  - In the future, we'll use these objects to gracefully migrate the configuration when we deprecate blocks.
- Improved PWM behavior when constrained.
- Fixed a bug where PWM/Digital actuators would suddenly turn on if the driving PID was disabled.
- Make display brightness configurable with a slider on the Spark 3.
  - Previously only supported on/off.
- Fixed a bug where widgets would not be placed at the end when copied to a dashboard.
- You can now view the PID relations from the settings dialog.
- You can now view graphs for block widgets from the settings dialog.
- Setting dialogs are now correctly closed when a breaking change is made. This happens when:
  - The block ID is changed.
  - The widget is removed.
  - The block is removed.
- Renamed Process View to "Brewery Builder".
- Fixed window scrolling when editing the Brewery Builder (again).
- Parts in the Brewery Builder can now be placed on top of each other.
  - An indicator will show how many parts are placed at the same position.
  - New parts can be created on top of other parts (useful when filling kettles or fridges).
- Standardized the Kettle part in Brewery Builder.
  - Kettle can be scaled in both width and height.
  - Small and Large kettles are now just kettles.
  - A liquid color can be set manually. This is a stopgap solution until we calculate liquid levels in kettles.
  - The text is now editable.
- Added the Filter Bottom part. It can be resized in width to visually fit the kettle.
- Improved handshake behavior in the Spark service.
  - The handshake is triggered repeatedly until a confirmation is received.
  - Added a timeout to the "waiting for handshake" state. Service is restarted after.
- Added runtime firmware updates.
  - This allows updating the controller over both Wifi and USB, without having to stop all other services.
  - Firmware changes were required, so the first opportunity to use the new update mechanism is the next release.
  - UI prompts to update will be enabled in the next release.
  - This minimizes the issue where actuators would turn on while the firmware was being updated.

## Brewblox release 2019/07/10

**Firmware release date: 2019/07/10**

This release adds some usability improvements, and fixes an annoying bug in the firmware.

An oft-requested feature was for the Step view widget to display which step already has been applied.
Note that this is independent from whether you actually clicked the button: it will consider the step active if applying it would not change anything.

The firmware had a bug where if the Spark couldn't find the network, it would retry before the previous search was finished. This would significantly slow down everything else.

**Changes**

- Fixed a bug where the controller becomes very slow if Wifi is unavailable.
- Improved the PID response to setpoint changes.
  - The proportional part of the calculation uses the immediate (unfiltered) value.
  - The integral still uses the filtered value.
- Added a filter option to Setpoint: unfiltered.
- Improved display of pending state in Digital Actuators and Motor Valves.
  - State is pending if one or more constraints block it.
  - A spinner is displayed over the desired state.
  - If the actuator is not driven, you can toggle the state back to the (non-constrained) setting.
  - A tooltip displays which constraint is currently blocking the state change.
- The Graph now displays a message if no data is available for the current settings.
- The "Apply Step" button is colored green if the step is currently active (matches the current state).
- If a value was changed during the Step view prompt, it is persisted in settings.
- Changed multiple parts in Process View:
  - Split the Pump in two parts: Pump, and PWM Pump.
  - Pump can be either manual, or linked to a digital actuator.
  - PWM pump is linked to a PWM (big surprise), and will turn slower/faster depending on PWM setting.
  - Actuator Valve can now also be linked to a Digital Actuator.
- Display settings are reset when removing all service blocks.

## Brewblox release 2019/07/01

**Firmware release date: 2019/07/01**

This release moves around some things to make it easier to understand the system:

- Filtering is moved from the PID to the (shared) setpoint.
  - The old value is not copied, so check the filter period in your updated setpoint widgets!
- The filter now stores the sensor value, instead of the difference between setting and sensor. As a result, the setpoint is no longer filtered. Changing it will trigger an immediate response.

We've reworked the Fermentation Fridge arrangement. The result should now be much more intuitive for both starting and expert users.
The default configuration now is that the actuators directly respond to the beer temperature, not via the fridge setpoint.
This is much easier to understand and is less sensitive to badly tuned PID settings.

If you are running a pretty standard fridge setup, you probably want to restart from scratch with the new wizard.

**Changes**

- Reworked the Classic BrewPi wizard.
  - It's now called "Fermentation Fridge".
  - Added documentation page at <https://brewblox.netlify.com/user/ferment_guide.html>
  - Generates fewer and more useful widgets on the new dashboard.
  - Simplified the Beer constant mode: it now directly uses the beer setpoint.
  - A Process View widget is added, displaying fridge/beer setpoints, and PID output.
  - Added back buttons in the wizard.
  - Automatically select unused block names.
  - Improved validation of block names.
  - Added short explanation while blocks and widgets are being created.
- Renamed `Setpoint/Sensor Pair` to `Setpoint`
- Moved the input filter from PID to Setpoint.
- The Setpoint filter can now be manually bypassed.
- The PID I value can now be manually set.
- Added multiple parts to the Process View widget.
  - Setpoint display
  - PID display
  - PWM display
  - Fridge (can change size)
  - Carboy (can display a setpoint)
  - Keg (can display a setpoint)
  - Beer bottle
- Added widget and block actions to the setting popups.
- Improved the rendering and scroll behavior of the relations diagram (again).
- Show widget type name in the settings popup toolbar.
- You can now copy steps in the Step View widget.
- Moved the "Add block" button to the bottom of the step in the Step View widget.
- Fixed a bug where Actuator valves in Process view couldn't be linked to Motor Valve blocks.
- Actuator toggle buttons now display a loading icon when they're waiting for a constraint.
- Added edit button to Driven indicator (click to open settings for the top-level driver).
- Added edit button in block selection popup.
- Added Clone Block action.
- Setpoints now display which PID blocks are using them as input.
- Added an option in Step View to prompt for the actual value before applying.
- Dashboard actions are now also shown in the dropdown on the dashboard toolbar.

## Brewblox release 2019/06/24

**Firmware release date: 2019/06/24**

**Changes:**

- Improved time to first load for the UI.
- Improved firmware compatibility check.
  - Now separately displays whether it's still waiting for the service <-> firmware handshake.
  - Fixed a bug where the service <-> firmware handshake would not happen.

## Brewblox release 2019/06/19

**Firmware release date: 2019/06/19** (Now also checked automatically)

WARNING: This release contains breaking changes

DS2408 Valves are now supported. We've also refactored actuators to be more consistent between DS2413 and Spark pins.

`Pin Actuator` and `DS2413 Actuator` no longer exist. The Spark now has a single block that contains references to all pins. There is now a single `Digital Actuator` block that can target either a Spark pin, or a DS2413 channel.

See [the updated control chain documentation](./control_chains.md) for a full overview of how this impacts configurations.

Newly introduced blocks: `DS2408 Chip` and `Motor Valve`. Their behavior is comparable to `DS2413 Chip` and `Digital Actuator`: `Motor Valve` targets a channel on `DS2408 Chip`, and can be toggled on (open) and off (closed).

`Motor Valve` is a valid target for `PWM` if you wish to have more fine-grained flow control.

**Migration:**

- Note down the current constraints of your `DS2413 Actuator` and `Pin Actuator` blocks.
- Update your system.
- Run the `Discover new OneWire Blocks` action in the Spark service page.
- Add `Digital Actuator` blocks to replace your (now disappeared) `DS2413 Actuator` and `Pin Actuator` blocks.
- Point your actuators towards the correct Spark pins or DS2413 pins.
- Set the constraints on your new actuators.

**Changes:**

- Added new blocks:
  - `Spark2Pins` (System object, only exists on Spark v1 and v2)
  - `Spark3Pins` (System object, only exists on Spark v3)
    - Allows toggling 5V and 12V
    - Displays actual 5V and 12V voltage
    - Allows toggling LCD backlight
  - `DS2408 Chip` (Discovered)
  - `Digital Actuator`
  - `Motor Valve`
- Removed blocks:
  - `Pin Actuator`
  - `DS2413 Actuator`
- Actuator Valves in Process View Widget now can be linked to `Motor Valve` blocks.
- Moved multiple Block actions to the Action dropdown button in the widget.
  - Rename Block
  - Choose Block (select different Block to be displayed by widget)
  - Block Info
  - Choose Groups
  - Choose Preset
  - Remove Block
- Improved edit popups for values.
- Improved performance when opening a dialog to select a block.
  - Options should now appear immediately.
- Unit fields (temperature, time, etc) will no longer automatically replace `-` with `0` while editing.
- Reworked the Datetime edit dialog.
  - For now we've gone with a masked input field.
  - The option to use a date picker will be re-added in a future release.
- Fixed rendering issues in graphs.
  - The graph in the Graph widget will now correctly update when resizing the widget.
  - Full-screen graphs will no longer be rendered small before updating to the correct size.
- Improved `Display Settings` layout.
  - Slots in the widget are now clickable, and will open the settings menu.
  - The settings menu layout now resembles the LCD layout: two rows of three slots.
  - Added border color to slots in the settings menu.
- The Block Relations diagram is now also scrollable in the horizontal direction.
- Fixed a bug where incorrect rules were used for Block names in wizards.
- Fixed multiple bugs in the widget wizard when creating a new widget for an existing block.
- In the PID widget, the entire input/output row are now clickable (opens settings dialog for input/output block)
- When selecting a link (target block / input block /etc), you now often have the option to create a new block of a compatible type
- The Spark service now compares service and firmware versions when connecting. An error will be displayed in the UI when they are incompatible.
- Fixed a bug where a disabled Setpoint driver would not stop driving the Setpoint Sensor Pair

## Brewblox release 2019/06/04

**Firmware release date: 2019/06/04**

We (hopefully) fixed the reboot issues people were experiencing, and added the Step View widget.

**Changes**

- Added Firmware Release Date to the Spark Widget. This should make it easier to check whether you need to flash the controller.
- Added the Step View widget.
  - This allows applying predetermined changes to multiple Blocks at the same time.
  - You can choose to change a subset of Block fields - values will be merged.
- Only reinitialize OneWire sensors when they are actually found, but have lost power since last read.
  - Previously a re-init was tried at every read error. This is a slow operation, which really slowed down the system when configured sensors were disconnected.
- When using 100Hz PWM, unregister interrupt handler before PWM block destruction (fixed hard fault SOS).
- Handle WiFi status and IP address display in system event handler.
  - A bug in particle device-os could cause a hard fault SOS when WiFi was connecting in the system thread while the application thread was trying to read the IP address.

## Brewblox release 2019/05/28

**Firmware version: 9b0330f4** (no changes)

Also compatible: 2789cc06.

A set of smaller changes. Two bigger features are in progress, but are not yet ready for release:

- A rework of digital actuators, to also support valve expansion boards.
- A stepper widget: apply predetermined changes to multiple Blocks at the same time.

**Changes**

- The Spark service page can now be sorted by Block role.
  - Roles are: Process, Control, Output, Limiter, and Display.
  - The icons in the Spark page index are now role-specific.
- Sorting in the Spark page is now persistent (will retain the setting if you reload the page).
- Fixed a bug where Block (widget) wizards would not allow `-` characters in the name.
- The Blocks in the relations diagram are now clickable.
  - Clicking on them will open the settings popup for that Block.
- Added a "show relations" action to PID.
  - This displays its direct relations: from the sensor input to the pin output.
  - Blocks in this display are also clickable.
- The metric selection trees in Graph/Metric wizards display fields that have had an update in the last day.

## Brewblox release 2019/05/20

**Firmware version: 9b0330f4** (no changes)

Also compatible: 2789cc06.

The UI can be very overwhelming and cluttered, especially for new users.
To combat this, we've updated the Spark page. It is now more suitable for quickly finding and showing specific blocks.

In the future, we'll also be grouping blocks more. For many use cases, [control loops](https://brewblox.netlify.com/user/control_chains.html) are more relevant than a bunch of loose blocks.

**Changes**

- Reworked the Spark service page.
  - An index is shown on the left, and the blocks on the right.
  - To show a block on the right, select it in the index.
  - Added searching and sorting blocks in the service page.
- Improved the block relations diagram.
  - Layout is now more inline with the control chain documentation diagrams.
  - Relations diagram is now scrollable.
  - Added an "export" button. This will export the full diagram as PNG.
  - Type display names are now used in the diagram (was: type id).
- Added preview graphs to Graph and Setpoint Profile widgets.
  - They're shown when editing the widget, if the browser window is at least 1500px wide.
  - We're considering whether to add them to all block widgets that can display fullscreen graphs.
- Fixed a bug where text fields in the Process view edit window would trigger tool shortcuts.
- Fixed a bug where editing copied widgets and parts would also change the original.
- Fixed scrolling in Graph and Metric widgets if a large number of metrics were selected.
- Changed the display name of "Offset Actuator" to "Setpoint Driver".
- Changed the display name of "Pulse Width Modulator" to "PWM".

## Brewblox release 2019/05/14

**Firmware version: 9b0330f4** (same as last week)

Also compatible: 2789cc06.

**Changes**

- Fixed a bug where the Block relations diagram would fail to render if any Block linked to a non-existent other Block.
- Removed a fix for an earlier bug, where the Process View edit window would calculate the wrong grid square when opened after scrolling the page.
  - The bug was also fixed upstream, making our fix an overcorrection.
- Improved error messages when the UI failed to save the change in the backend.
- Added the "Export errors" action.
  - This can be found in a dropdown menu in the bottom left corner of the sidebar.
  - This will save all REST/datastore errors in the current session to a .json file.
  - If you're getting error messages in the UI, please run this action, and add the file in your bug report.
  - Errors are only kept for the current session: please export them before refreshing the page.
- Fixed a bug where during creation of a Setpoint Profile, no target Block could be selected.
- Moved both Y-axes in graphs to the right side, for easier viewing of the latest value.
- The Brewpi Classic arrangement wizard now also creates a Graph widget
- During the Brewpi Classic wizard, initial fridge/beer setpoint values are configurable in the user-defined temperature units.
- The first created point in a Setpoint Profile is automatically set at 20 degC, 68 degF, or 293 degK, depending on the user-defined temperature unit.
- When editing the Graph settings, a small preview graph is displayed.
  - This is only shown if the browser viewport is more than 1500px wide.
- Fixed a bug in brewblox-devcon-spark where Blocks could not be read/changed/deleted using their numeric ID.

## Brewblox release 2019/05/07

**Firmware version: 9b0330f4**
If you're on the previous firmware version (2789cc06), you don't need to flash your Spark.

This release, we've reworked the brewblox-ctl tool. This improved code quality, and gives us more options for what we can do with future commands.

Running `brewblox-ctl` without a command will no longer open a menu, but now print all available commands. This allows us to add arguments to commands.

**Changes**

- Reworked brewblox-ctl.
  - When running brewblox-ctl on an ARMv6 platform (Raspberry Pi model 0 or 1), a warning message with a confirmation prompt will be shown on startup.
  - The firmware flash commands will no longer print a notification about updating particle-cli.
  - The flash/bootloader/wifi commands must now either be run in a Brewblox directory, or with the `--release` argument.
  - Added `brewblox-ctl http`. This is used by other commands to make HTTP requests, and can be used for debugging the system.
  - The system will automatically restart after running `brewblox-ctl update`
- Made decimal precision user-configurable in the Metrics widget.
- Made the rules for new Block IDs stricter to prevent future issues.
  - ID must start with a letter.
  - ID may consist of letters, numbers, spaces, and these characters: | ( ) \_ -
  - ID must not be longer than 200 characters.
- Fixed a bug where clicking on an actuator button in unknown state would do nothing.
- Disabled edit button (pencil) in PID widgets for input/output blocks that are not set.
- The Wizardry menu is now scrollable on smaller screens.
- Fixed a bug where the Block ID was still reserved if Block creation failed during importing of Spark Blocks.
- Fixed a bug where importing a large amount of Blocks over USB would cause a buffer overrun.

## Brewblox release 2019/04/29

**Changes**

- Added the Metrics widget
  - This is like the Graph widget, except that it only displays the last logged value from history.
  - It displays warning messages for values that have not been updated in a while. The "valid time" can be configured.
- Fixed importing/exporting Blocks on the Spark controller.
  - The export format has changed: old export files are no longer compatible.
  - The import button is re-enabled in the Spark service page.
  - If a Block couldn't be imported, it will be skipped, and a message will be displayed in the UI.
  - Removed the savepoints functionality, as it was made obsolete by the new import/export mechanics.
- Fixed a bug where Setpoint Profile would fail to save points with a temperature lower than 0°C.
- In Process View, if a part can be linked to a Block (valves, sensors), the part menu now has a shortcut to configure the linked Block.
- Fixed a bug where new Process View parts would be placed incorrectly if you scrolled the page before opening the edit modal.
- Improved widget layout: if a Block has both a setting, and a measured value, it will consistently display setting before (left of) value.
- Services will now log their version on startup.
- EDIT: brewblox-ctl now allows disabling confirmation prompts. Run `brewblox-ctl settings` to enable/disable.

## Brewblox release 2019/04/23

There are no firmware changes in this release. If you have the latest version (2019/04/18), you do not need to flash your Spark. When in doubt, it's best to be safe and flash your Spark.

**Changes**

- In the Process View edit modal, tools can now be swapped by hotkey.
  - Keys are listed to the right of the tool in the side bar.
- In Process View, parts can be flipped again, using either the part menu, or the Flip tool.
- Improved part display in the "New Part" modal.
- Moved generic actions from the Spark Widget modal to the Actions button in the Spark service page.
- Fixed a bug in Graph where the config would be corrupted when changing display type.
- Fixed a bug in PID where Measured and Target output were displayed swapped.
- DS2413 actuators are now viable options when running the BrewPi classic arrangement wizard.
  - For now, you must manually create the DS2413 actuator.
  - A button to create new blocks was added to the wizard.

## Brewblox release 2019/04/18

This is a small release, to fix two serious bugs. We will be releasing new features after Easter.

**Changes**

- Fixed a bug where setpoint profile time values would be corrupted after changing them.
- Fixed a bug where some Block wizards would crash.

## Brewblox release 2019/04/16

- Fixed how setpoint/sensor pair works, so that setting can always be set and enabled/disabled is handled separately.
- Fixed some issues with popup edit menus
- Make invalid widgets deletable
- Fix tree dropdown in graph config to not hide children when search is used

## Brewblox release 2019/04/15

**Breaking Changes**

- SetpointSimple Blocks no longer exist, and have been merged into SetpointSensorPair
- SetpointProfile now drives SetpointSensorPair
- In Process View, rotated parts larger than 1x1 will have moved a few squares.
  - This is due to the new calculation for rotating parts

**Changes**

- Resolved multiple issues with setpoints.
  - Merged SetpointSimple and SetpointSensorPair.
  - All fancy setpoints (eg. SetpointProfile) are now drivers of SetpointSensorPair.
  - Thanks @j616s for the suggestion of making SetpointProfile a driver!
- Fixed a bug where disabling a PID would not set its output value to 0.
- Overhauled how Process View is edited:
  - Editing is now done in a fullscreen modal. The widget is never editable.
  - Moved "Export widget" and "Delete all parts" actions to the edit modal.
  - Parts are highlighted on mouseover in the edit modal.
  - Editing can be done with selectable tools. Select a tool, and then click or drag parts.
  - Available tools:
    - Click to add new part.
    - Drag to move part.
    - Click to rotate part.
    - Click to open part menu (edit settings).
    - Click to interact with part (toggle valves and pumps).
    - Drag to copy part.
    - Click to delete part.
- Parts now consistently react if you click in the square containing the part.
- When rotating parts, the upper left corner will stay in place. (the part used to rotate around its center).
- Fixed a bug where flows would be incorrectly calculated for rotated parts greater than 1x1.
- Improved responsiveness when moving parts.
- Improved collision detection when moving parts.
- HeatingElement parts can now be linked to a PWM Block, and will display the achieved duty setting.
- Fixed a bug where ActuatorValve parts would cause datastore conflicts
- Fixed a bug where datastore conflicts would cause Process View to silently stop persisting changes
  - An error is now displayed, and the last change is rolled back. You can redo the change to continue.
- Widgets are now unpinned when moved or copied.
- Disabled the "Import Blocks" button while we fix some serious issues.
- When a service loses connection, a notification with a "Retry" button is displayed.
  - This notification will disappear automatically if connection is restored.
- Made PID input/output blocks directly editable from the PID widget.

## Brewblox release 2019/04/04

This release includes a pretty big rework of the UI.

The framework we're using for UI components ([Quasar](https://v1.quasar-framework.org/)) recently released a major update.
While we were making all the required changes, we took the opportunity to revisit many of our more clumsy UI elements.

We're pretty happy with the result. It looks better, loads faster, and the underlying code is significantly cleaner.

Changes:

- Lots of small display improvements throughout the UI.
  - The dashboard background is now lighter than the widgets, improving contrast.
  - Widget title is now displayed above the type to improve display of small widgets.
  - Widgets now have a dropdown menu with additional actions. This allowed us to add more actions while saving space.
  - Improved layout for all widgets and widget settings forms.
  - Removed color from unimportant warnings (eg. inactive actuators).
  - Improved and standardized the toolbar in modal windows (eg. Widget settings).
- The Block relations diagram is now displayed fullscreen.
- Fixed multiple issues with the Block relations diagram, and improved startup time.
- Reworked all wizards to be more consistent and easier to navigate.
- The widget options menu (accessible in dashboard edit mode) is removed.
- Added the widget actions to a dropdown menu. This makes copy/move/delete widget buttons more accessible.
- You can now resize widgets without activating dashboard edit mode.
  - Widgets on the Spark page are still not resizable.
- Fixed an issue where the version would not display in the left drawer.
- You can now separately change dashboard title (displayed) and ID (unique, used for the URL)
- Widget names were reworked.
  - Widget names no longer have to be unique.
  - Block widgets now always use the Block ID as name. This improves visibility how widgets and blocks are linked.
  - You can freely change names for non-block widgets (graph, session view, process view).
- You can now export and import widgets.
  - For now the Process view is the only widget where exporting it makes any sense.
  - Import widgets in the Wizardry menu.
- You can now export, import, and clear Blocks on the controller.
  - The functionality is accessible through the Spark Service widget.
  - Exporting Blocks will export all Blocks.
  - Clearing Blocks will remove all user-added Blocks, and reset the system Blocks.
  - Importing Blocks will first clear Blocks, and then import from file.
- Fixed a bug where the Lauterhexe Process view part did not have any flow.
- Added the small and large kettles to the Process view.
  - This is in addition to the "normal" kettle already available.
- Added the Sensor display part to the Process view. It can be linked to a temperature sensor, and will display the value.
- Added the Actuator valve part to the Process view. It can be linked to a digital actuator (Actuator Pin or DS2413 Actuator).
  - Toggling the valve will toggle the actuator, and vice versa.
- Fixed a bug where the eventbus would gradually consume more RAM, until it froze.

## Brewblox release 2019/03/18

- `brewblox-ctl update` will now prompt to also update the firmware
  - IMPORTANT: this does not apply to this update. You will need to manually run `brewblox-ctl flash` this time.
- Updated the firmware system layer to version 1.0.1. This will be automatically applied when updating the firmware.
- Fixed a bug where brewblox-ctl would not create downsampling rules in history (only display 4.5 hours in graphs)
- The graph widget can now be displayed fullscreen
- Graphs now have preset buttons for displayed period (duration to now: 10m, 1h, 1d, 7d, 14d, 30d)
- Blocks now display whether their values are set by other blocks (eg. PWM controlled by PID).
- When a PID is disabled, it will stop overriding the setting of its output block.
- PWM and offset actuator can now be disabled separately. This allows manually setting their target.
- PWM now supports a 100Hz mode when controlling digital pins.
  - This can be used for driving DC pumps or fans.
  - This will be triggered automatically when the period is set to less than 1s.
  - OneWire actuators still have a minimum period of 1s.

Apart from these changes, we're working on the implementation of a drag-n-drop interactive display of a brewery - flows included.
<https://brewpi-ui-demo.herokuapp.com/processview/herms-automated-valves> is the prototype and proof of concept. The Brewblox implementation will allow users to recreate their own setup, and control / view their blocks in the display.

When the most important features are included, we will start drawing more attention to it in the UI, and add it to the BrewPi classic wizard.

For those interested in an early preview: it is creatable as the `Process View` widget.

## Brewblox release 2019/03/11

This release includes changes to the firmware. To update, please run both `brewblox-ctl flash`, and `brewblox-ctl update`.

- The Spark LCD can now display temperatures as either Celsius or Fahrenheit. This is configurable in the Display Settings widget.
- Added a wrapper in brewblox-ctl to make HTTP request commands significantly shorter.
- Dashboards are now displayed as a list of cards on mobile devices. This eliminates clipping, but dashboard editing is disabled.
- Fixed a bug where you no longer could show/hide single values in graphs by (double) clicking.
- Graph values mapped to the right axis are now indicated by having a different color title in the legend.
- Fixed a bug where Spark Photon devices would not be discovered over USB.
- Added the `--discovery=all|usb|wifi` argument for the Spark service. This allows specifying connection type without hard-coding the address. Defaults to "all".
  - This can be used in combination with `--device-id`.
