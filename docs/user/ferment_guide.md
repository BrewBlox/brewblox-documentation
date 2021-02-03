# Getting started: fermentation fridge

While going through the [startup guide](./startup.md), you may have run the *Fermentation fridge* quick start wizard. This wizard asked you some questions, and then generated a dashboard and some widgets.

This guide walks you through the basics of using these widgets to monitor and control your fridge.

![Ferment Fridge page](../images/fermentation-fridge-dashboard.png)

## Ferment Assistant

![Temp Control Assistant](../images/ferment-assistant.png)

The Temp Control Assistant widget groups the most common settings, and makes it easy to switch between fridge and beer modes.

**Control modes** keep track of the PID settings for Beer and Fridge modes.
When changing modes, your system will adjust the PID settings, and start using the other temperature sensor.

The **Setpoint enabled** toggle indicates whether your system is active at all.
If the Setpoint is disabled, your PIDs will be inactive, and your actuators will not cool or heat.

If the **Setpoint driven by Profile** toggle is enabled, your Setpoint and Setpoint profile are both enabled.
More on temperature profiles below.

The **Check for problems** button verifies your block settings, and offers to fix any and all problems it found.

::: tip
If you are still using a fermentation fridge setup with a Quick Actions widget, you can also manually add a Temp Control Assistant widget.

Link it to your blocks, and it will automatically show a button to store PID settings as mode.
:::

## Temperature profiles

![Setpoint Profile dialog](../images/ferment-setpoint-profile.png)

Temperature profiles are a list of points with a **time** and a **temperature**.
When enabled, the controller gradually changes a setpoint to follow the line between the profile points.

All points are saved as an offset from the start time, so you can easily re-use profiles.
Change the start time, and all other points will be shifted.
You can also create, load, and save profiles from the action menu.

The profile is stored on the Spark itself. The Setpoint Profile continues to run if the Spark has no connection to the server (the Pi).

The Ferment Assistant shows a **Setpoint driven by Profile** toggle that indicates the current state of the Setpoint Profile.

## Graphs

![Graph dialog](../images/ferment-graph.png)

Spark data is logged whenever your services and controller are running.
You do not have to explicitly start or stop logging.

In the Graph settings you can add or remove tracked fields, or change the tracked period.
The wizard generated a Graph widget with some useful values already added,
but feel free to customize this at will.
You will not lose any data when deselecting fields.

::: tip
To keep track of data for specific brews, you can add a [Session Log](./all_widgets.html#session-log) widget.
:::

## Builder layout

![Ferment Fridge layout](../images/fermentation-fridge-layout.png)

The Quick Start wizard also created a Brewery Builder layout with a representation of your setup.
The layout is shown in a widget on your dashboard, but also has its own page.

Click on the values in your layout to edit block settings, or get more information.

::: tip
There's a lot more you can do with the builder.
See the [Brewery Builder guide](./builder_guide) for more details.
:::

## Advanced settings

![Relations](../images/ferment-relations.png)

The fermentation setup uses a set of interdependent *Blocks* that run on your Spark controller.

Your dashboard offers you shortcuts to make changes to your block settings such as updating a setpoint setting, or starting a profile.
If you want to customize, extend, or tweak your setup, then there is a lot of freedom to do so.

The [control chains guide](./control_chains) is a good place to get an understanding of how blocks can be combined.

There are also other [widgets](./all_widgets) that may prove useful to add to your dashboard.

A single Spark can control multiple fermentation setups, but sometimes it's more convenient to [add another Spark](./adding_spark).
