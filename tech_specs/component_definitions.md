# Definitions and mapping of GUI entities

Components as defined by the controller firmware are not fully suited for use by the service and GUI layers, as they lack a clear mapping to user concepts.

Note: see PlantUML output of `block_diagram.txt` for pictures.

## User Considerations

In order to adjust software to the user (and not the other way around), it's good to keep in mind what aspects are important for the user:

* Objects should match user expectations as to what "belongs together"
    * If it has a plug, it's a thing.
    * If it has a distinct task, it's a thing.
    * If you'd buy it together as a single item, it's a thing.
    * Things can be grouped or combined in another thing.
* Feedback is important
    * When linking a UI block to a piece of hardware, you should know immediately if you picked the wrong one.
    * When one item suddenly starts malfunctioning, it should tell you what went wrong, and what part is responsible

## Relations

At the lowest level, there is a collection of I/O signals interacting with the controller firmware. At the highest level, the user is brewing beer. (Probably. We're not sure.)

In order to make these ends meet, we can identify the following levels:

### Control Center (eg. "Brewery Two")

The top level grouping inside the GUI application. All sensors, actuators, and settings for a single service are somewhere in here. UI blocks are stored here, so multiple views can share them.

### View (eg. "Fermentation" / "Overview" / "All temperature sensors")

A canvas displaying one or more widgets. Views do not directly display data or actions: they contain all objects (widgets) that do.

Views can contain other views. Views can share widgets.

### Widget (eg. UI Block / Graph)

All discrete objects in the UI are widgets. UI blocks display state and actions, graphs display history. Widgets can be created and moved by users.

The same widget can be present on multiple views.

### UI block (eg. PID, actuator, mutex)

Represents a hardware component performing a specific, abstract task. A UI block isn't busy brewing beer. It might keep temperature at a certain level, or even just toggle the heater.

If associated with a hardware component, they display current state - not history. The UI may choose to add a button to easily view the history graph for the same hardware component.

UI blocks are an abstraction. They can be associated with hardware components, but do not have to be.

### History graph

Displays past state of hardware components. Where a UI block displays current state, a history graph displays the history of one or more hardware components over a time frame.

## Serialization

Two datasets require persistence and serialization: values used as input/output by the controller, and user-defined components.

### Value Serialization

Controller <-> service layer communication is already specced, and outside the scope of this document.

Specing of serialization and schemas of service <-> UI data transfer is still TODO.

### Component Serialization

For the purposes of serialization, views, and UI blocks should all be capable of serialization without their parents. 
Two modes of serialization should be offered: with and without hardware associations.

View persistence requires saving hardware associations, but configurations shared between users should not have to assume that hardware mappings are perfectly identical.

## Data Collection

Data is collected by the service layer, and persisted using InfluxDB.

We are interested in the following data points:
* Controller measurement values
* Controller block connected/disconnected
* UI block association with controller block added/removed
* Controller block configuration changed
* User added annotation to time point
* User sends command to controller
* Controller acknowledges command

We want to filter on the following data points / properties:
* events
* UI blocks
* hardware blocks
* annotations
* activity members
* process members
* composited UI block members
* time points

We want to simultaneously display data from (including all members):
* views
* UI blocks
* hardware blocks

## Data Schema

TODO: pending spec of serialization schema

Default configuration is to create a measurement per activity.
Optional, depending on volume: measurement per controller block
Future enhancement: allow users to create a measurement per process, or per UI block

Values:
* Key: controller block name
* Value: measurement

Tags:
* Keys: `connection_events`, `association_events`, `configuration_events`, `annotation`, `command_events`, `status_events`, `data_source`
* Values: string representations. In case of multiple simultaneous events of the same type, they can be separated by `;`

Notes:
* Saving data using controller representation of objects requires later matching of UI block <-> controller block
* So far little practical data on how often events would overlap
* How efficient is string matching `;`-separated values when filtering for events?
* Requires research: do users want to primarily track their logical object (UI block), or the physical object?
* Should influxDB be aware of mapping?
