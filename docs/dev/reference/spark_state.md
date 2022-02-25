# Spark service state

Every few seconds, the Spark services publishes its current [state](./state_events).
This document serves as reference for the topic and payload schemas used.

All referenced code snippets use the [TypeScript interface syntax](https://www.typescriptlang.org/docs/handbook/interfaces.html).

## Spark state events

The main Spark state event is published to the `brewcast/state/<Service ID>` topic.
This includes service state, and current block settings and values.

<<< @/shared-types/spark-service-types.ts#SparkStateEvent

`key` is always set to the Service ID (eg. `spark-one`). This will match the slug in the topic.

`type` is a constant string, used to verify events.

`data.status` describes the currently connected controller (if any), and whether it is compatible with the service.
If `data.status` is null, the service is currently offline.

`data.blocks` lists all blocks on the controller.
The interfaces for all block types are documented [here](./block_types).

## Spark status

<<< @/shared-types/spark-service-types.ts#ApiSparkStatus
<<< @/shared-types/spark-service-types.ts#SparkFirmwareInfo

`device_address`, `connection_kind`, `device_info`, and `handshake_info`
all describe the currently connected controller, and will be null if no controller is connected.

The `is_autoconnecting` flag is toggled through the API.
The service will wait until it is `true` before it attemps to discover and connect to a controller.

`is_connected`, `is_acknowledged`, and `is_synchronized` indicate the current status of the service <-> controller connection.

First, the service attempts to connect to a controller.
This process is described in the [Spark connection settings guide](../../user/services/spark.html#spark-connection-settings).

After the service is connected, the controller will send a handshake message. This is a plaintext string with device information. The contents are stored in the `status.device_info` field. More on this below.

If the handshake message is received, the `is_acknowledged` flag is set.

If the controller is compatible (more on this below),
the service performs additional synchronization steps.

Some examples:
- Setting controller date/time.
- Getting block names from the datastore.
- Collecting trace logs from the controller.

Once this is done, the `is_synchronized` flag is set, and the synchronization process is done.
The service will now read/write blocks on the controller.

The `is_connected`, `is_acknowledged`, and `is_synchronized` flags are always set in order:
it is impossible for the service to be synchronized without it being connected.

## Block relations

<<< @/shared-types/spark-service-types.ts#BlockRelation

Relevant links between blocks are analyzed, and published as part of the service state.
The relations can be used to map the active control chains.
For an example of this, see the relations view on the Spark service page in the UI.

While typically the block that defines the link is considered the relation *source*, this is not guaranteed.
For example, the *PID* block has a link to its input *Setpoint*,
but for the purposes of the control chain, the Setpoint is considered the source, and the PID the target.

## Drive chains

<<< @/shared-types/spark-service-types.ts#BlockDriveChain

When one block is actively and exclusively controlling another block, this is referred to as *driving*.
Driving blocks may in turn be driven by another block (a *Digital Actuator* is driven by a *PWM* which is driven by a *PID*).

These drive chains are analyzed, and published as part of the service state.
A chain is generated for every combination of driven block and initial driver (a driving block that is not driven).

Given a typical fermentation control scheme with these blocks...
- Heat PID
- Heat PWM
- Heat Actuator
- Cool PID
- Cool PWM
- Cool Actuator
- Spark Pins

...the following drive chains will be generated
- target=Spark Pins, source=Heat PID, intermediate=[Heat Actuator, Heat PWM]
- target=Heat Actuator, source=Heat PID, intermediate=[Heat PWM]
- target=Heat PWM, source=Heat PID, intermediate=[]
- target=Spark Pins, source=Cool PID, intermediate=[Cool Actuator, Cool PWM]
- target=Cool Actuator, source=Cool PID, intermediate=[Cool PWM]
- target=Cool PWM, source=Cool PID, intermediate=[]

## Firmware compatibility

The Spark service is shipped with binaries for the controller,
and a .ini file containing firmware version info.

After the service connects to the controller, the controller sends a handshake message containing its version info.
This is used to determine compatibility between the service and the controller.

The conclusions from this comparison can be found in the `handshake_info` field.

The service and controller are considered compatible if `service_info.proto_version` equals `device_info.proto_version`.

The service will abort synchronization if the controller is incompatible.

If the proto versions match, but `service_info.firmware_version` does not equal `device_info.firmware_version`,
the controller is still considered compatible.
The UI is responsible for prompting the user to update his/her firmware.

Synchronization is also aborted if the controller device ID does not match the desired device ID (set with the `--device-id` flag).

## Spark patch events

Whenever a single block is changed or removed, a patch event is published. Patch events implicitly modify the last published Spark state event.

Clients are free to ignore patch events, and wait for the next published Spark state event.

Patch events are published to the `brewcast/state/<Service ID>/patch` topic.

<<< @/shared-types/spark-service-types.ts#SparkPatchEvent

`key` is always set to the Service ID (eg. `spark-one`). This will match the slug in the topic.

`type` is a constant string, used to verify events.

`data.changed` will be a list of [blocks](./block_types) where settings were changed since the last state event.
Changes to sensor values will not trigger a patch event.

`data.deleted` is a list of block IDs matching blocks that were removed since the last state event.

## Spark update events

During firmware updates, progress is published using state events.
This does not apply to firmware updates triggered by `brewblox-ctl flash`.

Patch events are published to the `brewcast/state/<Service ID>/update` topic.

<<< @/shared-types/spark-service-types.ts#SparkUpdateEvent

`key` is always set to the Service ID (eg. `spark-one`). This will match the slug in the topic.

`type` is a constant string, used to verify events.

`data.log` contains new progress messages.
