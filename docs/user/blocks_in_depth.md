# Blocks in depth

:::tip
This page describes the how and why of blocks throughout the system.

For an overview of available blocks, see the [blocks page](./all_blocks.md).

For a how-to guide on resetting the blocks on your system, see the [guide to removing things](./removing_things.md).
:::

A central concept in Brewblox is the Block. Blocks can be combined to build the [control chains](./control_chains.md) that manage brew day or fermentation temperature.

The Spark controller, Spark service, and UI all transform blocks before they are rendered in widgets, graphs, or builder parts.

## Spark controller: independent and binary

To make the system more reliable, block data is directly stored on the Spark controller. The controller is the source of truth: the rest of the system gets block data by asking the controller.

If you unplug your Pi, your controller will keep working, using its current settings. If you reboot the controller, it still has its block data.

The persistent memory on the controller is tiny. The firmware uses its own filesystem protocol to efficiently store blocks. It's pretty good at it too: depending on the blocks, you can create 60-80 of them before running out of space.

The controller simply doesn't have space for block names. It uses 16-bit numbers as block ID (the `NID`, or `Numeric IDentifier`).

## Spark service: data conversion

Whenever the Spark service reads block data from the controller, it does the following:

- Convert data from the [controlbox protocol](../dev/reference/spark_communication) to JSON.
- Convert values to user units (the controller always uses Celsius).
- Find the block name (`SID`, or `String IDentifier`) associated with the block `NID`.

The Spark service uses the `datastore` service to store `SID` / `NID` associations and user unit preferences.

If it can't find an `SID` while converting blocks, it will generate one. For example: `New|TempSensorOneWire-1` is a common example of a generated name.

## UI: referencing blocks

The UI always asks the Spark service for a list of blocks on the controller.
All those blocks are displayed on the service page. If a block is deleted on the controller, it will automatically disappear from the service page.

When a (block) widget is added to a dashboard, it doesn't store the block data. It only stores a reference to the block: the service ID + the block ID (`SID`).

When you remove a widget from a dashboard, the referenced block is not automatically removed from the controller. When you remove a block from the controller, no widgets are removed from dashboards.

The same goes for Builder parts. A reference is stored, and used to find the block data in the list sent by the service.

## Creating and discovering blocks

Roughly speaking, there are three kinds of blocks:

- System blocks
- Discovered blocks
- Created blocks

System blocks can't be created or deleted. They're required for the controller to do its job. For example, the `DisplaySettings` and `SparkPins` blocks are system blocks.

Broadly speaking, whenever you plug in a OneWire sensor or extension board, a new block is discovered. (You may need to refresh the UI, or click `Discover new OneWire blocks`).
The server will generate a name for it when it next reads blocks from the controller. Some examples of discovered blocks are: `OneWire Temp Sensor`, `DS2413 Chip`, `DS2408 Chip`.

All other blocks are created in the UI - either by you, or by a quickstart wizard.

## Consequences

This architecture of controller, service, and UI all working together has many advantages, but also some drawbacks.

The most obvious one is that blocks are stored in multiple places. You can remove all block names without removing the blocks themselves, and vice versa.

The 16-bit ID used by the controller is also far from unique. If you'd use a second Pi to remove and replace all blocks on your controller, and then reconnect the first Pi, the service would "recognize" many blocks because their `NID` was reused.

For instructions on how to prevent or fix this, see the [guide to removing things](./removing_things.md).
