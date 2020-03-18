# Brewblox release notes

Relevant links:

- User guides: https://brewblox.netlify.com/
- Previous release notes: https://brewblox.netlify.com/user/release_notes.html
- Project board: https://github.com/orgs/Brewblox/projects/1
- Code repositories: https://github.com/Brewblox


## Edge release 2020/03/18

**Firmware release date: 2020/03/02**

**Changes**

- Added the `Brewery` page mode, for full-screen display of a single Builder layout.
- Added [documentation page](https://brewblox.netlify.com/user/all_widgets.md) describing all widget types.
- Added [documentation page](https://brewblox.netlify.com/user/all_blocks.md) describing all block types.
- Timeout values for Spark services are now configurable in docker-compose.yml.
- Refactored part settings dialogs in Builder.
- Fixed a bug where no block was selecatable as link in the Temp Sensor part.
- Fixed a bug where a disabled PWM pump part was still animated.
- Decreased minimum Builder layout size to 1x1.

## Edge release 2020/03/05

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

## Edge release 2020/03/02

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

## Edge release 2020/02/12

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

## Edge release 2020/01/20

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

## Edge release 2020/01/02

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

## Edge release 2019/12/23

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

## Edge release 2019/12/17

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

## Edge release 2019/12/06

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
  - https://github.com/Brewblox/brewblox-plaato
- `brewblox-ctl update` will prompt for pruning images at the start, not halfway in.
  - Due to how brewblox-ctl updates itself, this will take effect in the next update.
- Improved rendering when there is a large number of dashboards.
  - Dashboards will no longer scroll in front of the bottom buttons in the sidebar
  - In wizards, a dropdown will be shown if there is a large number of dashboard options.

## Edge release 2019/12/03

**Firmware release date: 2019/12/03**

While the initial installation by now is pretty smooth, editing `docker-compose.yml` has a steeper learning curve.

To counteract this we moved some configuration, and added two commands to brewblox-ctl: `discover` and `add-spark`.

`brewblox-ctl discover` scans USB/Wifi for devices, and will print the ones it found.

Example:
```
pi@fridgepi:~/brewblox $ brewblox-ctl discover
usb 280038000847343337373738 Photon
wifi 280038000847343337373738 192.168.0.57 8332
wifi 240024000451353432383931 192.168.0.86 8332
```

`brewblox-ctl add-spark` will create a new Spark service in `docker-compose.yml`.
It accepts multiple arguments, some mandatory, some optional.

For reference, see the updated docs for [adding a spark](https://brewblox.netlify.com/user/adding_spark.html) and [connection settings](https://brewblox.netlify.com/user/connect_settings.html).

Example call:
```
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
  - https://brewblox.netlify.com/user/multiple_devices.html
  - https://brewblox.netlify.com/user/adding_spark.html
  - https://brewblox.netlify.com/user/connect_settings.html
- The `--device-id` flag in the Spark service configuration is now checked when connecting to a controlller.
  - This allows it to be used in combination with `--device-host`.
- Prettified Quick Actions editor
- Fixed a bug in glycol wizard actions

## Edge release 2019/11/21

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

## Edge release 2019/11/12

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

## Edge release 2019/10/17

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
- When visiting the Spark IP in the browser, it now also shows its unique device ID.
  - This should make it easier to setup a configuration that uses multiple Sparks connected over Wifi.
  - See https://brewblox.netlify.com/user/connect_settings.html#spark-connection-settings for how this device ID can be used.
- Fixed a bug in the Glycol wizard that would not allow the user to create a configuration without a glycol sensor.

## Edge release 2019/10/10

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


## Edge release 2019/10/01

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


## Edge release 2019/09/12

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

## Edge release 2019/08/22

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

## Edge release 2019/08/12

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

## Edge release 2019/08/07

**Firmware release date: 2019/08/06**

The UI now supports third-party plugins. If you want to add your own custom widgets, you can now do so.
We created the example repository https://github.com/Brewblox/brewblox-plugin to get developers started.

**Changes**

- Added the plugin menu to the sidebar.
  - Plugins are loaded from an URL, and require a page reload to activate.
  - If a plugin failed to load, an error is shown here.
- Fixed a bug where fast PWM mode failed to activate (Spark pins automatically switch to 100Hz mode when PWM period is set to < 1s)
- Fixed a bug where you could not select a different service in the Fridge arrangement wizard.

## Edge release 2019/07/30

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

## Edge release 2019/07/23

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

## Edge release 2019/07/18

**Firmware release date: 2019/07/17**

Due to Elco's upcoming holiday, we decided to push some firmware changes now. This leaves us time to fix any
critical issues while he's still here.

This release does include a pretty exciting change: we can now update firmware over Wifi! You can even run it from the UI, without having to restart your services.

### IMPORTANT: If you skipped the last update, you'll need to run `brewblox-ctl flash` to enable updates in the UI.

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

## Edge release 2019/07/15

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

## Edge release 2019/07/10

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

## Edge release 2019/07/01

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
  - Added documentation page at https://brewblox.netlify.com/user/ferment_guide.html
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

## Edge release 2019/06/24

**Firmware release date: 2019/06/24**

**Changes:**

- Improved time to first load for the UI.
- Improved firmware compatibility check.
  - Now separately displays whether it's still waiting for the service <-> firmware handshake.
  - Fixed a bug where the service <-> firmware handshake would not happen.

## Edge release 2019/06/19

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

## Edge release 2019/06/04

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
  - A [major bug](https://github.com/particle-iot/device-os/issues/1805) in particle device-os could cause a hard fault SOS when WiFi was connecting in the system thread while the application thread was trying to read the IP address.

## Edge release 2019/05/28

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

## Edge release 2019/05/20

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

## Edge release 2019/05/14

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

## Edge release 2019/05/07

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

## Edge release 2019/04/29

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

## Edge release 2019/04/23

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

## Edge release 2019/04/18

This is a small release, to fix two serious bugs. We will be releasing new features after Easter.

**Changes**

- Fixed a bug where setpoint profile time values would be corrupted after changing them.
- Fixed a bug where some Block wizards would crash.

## Edge release 2019/04/16

- Fixed how setpoint/sensor pair works, so that setting can always be set and enabled/disabled is handled separately.
- Fixed some issues with popup edit menus
- Make invalid widgets deletable
- Fix tree dropdown in graph config to not hide children when search is used

## Edge release 2019/04/15

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

## Edge release 2019/04/04

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

## Edge release 2019/03/18

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
https://brewpi-ui-demo.herokuapp.com/processview/herms-automated-valves is the prototype and proof of concept. The Brewblox implementation will allow users to recreate their own setup, and control / view their blocks in the display.

When the most important features are included, we will start drawing more attention to it in the UI, and add it to the BrewPi classic wizard.

For those interested in an early preview: it is creatable as the `Process View` widget.

## Edge release 2019/03/11

This release includes changes to the firmware. To update, please run both `brewblox-ctl flash`, and `brewblox-ctl update`.

- The Spark LCD can now display temperatures as either Celsius or Fahrenheit. This is configurable in the Display Settings widget.
- Added a wrapper in brewblox-ctl to make HTTP request commands significantly shorter.
- Dashboards are now displayed as a list of cards on mobile devices. This eliminates clipping, but dashboard editing is disabled.
- Fixed a bug where you no longer could show/hide single values in graphs by (double) clicking.
- Graph values mapped to the right axis are now indicated by having a different color title in the legend.
- Fixed a bug where Spark Photon devices would not be discovered over USB.
- Added the `--discovery=all|usb|wifi` argument for the Spark service. This allows specifying connection type without hard-coding the address. Defaults to "all".
  - This can be used in combination with `--device-id`.
