# Spark service events

Every few seconds, the Spark service publishes [history and state events](./event_logging).
This document serves as reference for the content of these events.

All referenced code snippets use the [TypeScript interface syntax](https://www.typescriptlang.org/docs/handbook/interfaces.html).

## History

The Spark history events are published to the `brewcast/history/<service_name>` MQTT topic.

The `data` field is an array containing a subset of all block data. Fields with non-numeric, invalid, or constant values are omitted.

## State

The Spark state events are published to the `brewcast/state/<service_name>` MQTT topic.

The `data` field contains all blocks on the controller and volatile service state.

## SparkStateEvent

<<< @/shared-types/spark-service-types.ts#SparkStateEvent

The top-level fields (*key*, *type*, *ttl*, *data*) are mandated by the [state events spec](./event_logging).

`data.blocks` lists all blocks on the controller.
The interfaces for all block types are documented [here](./block_types).

`data.status` describes the currently connected controller (if any), and whether it is compatible with the service.

If `data.status` is null, the service is currently offline.

## Spark status

<<< @/shared-types/spark-service-types.ts#ApiSparkStatus
<<< @/shared-types/spark-service-types.ts#SparkFirmwareInfo

`device_address`, `connection_kind`, `device_info`, and `handshake_info`
all describe the currently connected controller, and will be null if no controller is connected.

The `is_autoconnecting` flag is toggled through the API.
The service will wait until it is `true` before it attemps to discover and connect to a controller.

`is_connected`, `is_acknowledged`, and `is_synchronized` indicate the current status of the service <-> controller connection.

First, the service attempts to connect to a controller. 
This process is described in the [Spark connection settings guide](../../user/connect_settings).

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
