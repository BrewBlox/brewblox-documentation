# Blocks in Brewblox

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

## Spark service: data conversion

Whenever the Spark service reads block data from the controller, it does the following:

- Convert data from the [cbox protocol](../dev/reference/cbox.md) to JSON.
- Convert values to user units (the controller always uses Celsius).

## UI: referencing blocks

The UI always asks the Spark service for a list of blocks on the controller.
All those blocks are displayed on the service page. If a block is deleted on the controller, it will automatically disappear from the service page.

When a (block) widget is added to a dashboard, it doesn't store the block data. It only stores a reference to the block: the service ID + the block name.

When you remove a widget from a dashboard, the referenced block is not automatically removed from the controller. When you remove a block from the controller, no widgets are removed from dashboards.

The same goes for Builder parts. A reference is stored, and used to find the block data in the list sent by the service.

## Creating and discovering blocks

Roughly speaking, there are three kinds of blocks:

- System blocks
- Discovered blocks
- Created blocks

System blocks can't be created or deleted. They're required for the controller to do its job. For example, the `DisplaySettings` and `SparkPins` blocks are system blocks.

Broadly speaking, whenever you plug in a OneWire sensor or extension board, a new block is discovered. (You may need to refresh the UI, or click `Discover new OneWire blocks`).
The controller will automatically generate a name for the discovered block.
You can change this name later.
Some examples of discovered blocks are: `OneWire Temp Sensor 0056dfa1`, `DS2413 0011223344`, `DS2408 afde4310`.

All other blocks are created in the UI - either by you, or by a quickstart wizard.
