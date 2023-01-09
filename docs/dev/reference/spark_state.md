# Spark service state

Every few seconds, the Spark services publishes its current [state](./state_events.md).
This document serves as reference for the topic and payload schemas used.

All referenced code snippets use the [TypeScript interface syntax](https://www.typescriptlang.org/docs/handbook/interfaces.html).

## Spark state events

The main Spark state event is published to the `brewcast/state/<Service ID>` topic.
This includes service state, and current block settings and values.

<<< @/node_modules/brewblox-proto/ts/spark-service-types.ts#SparkStateEvent

`key` is always set to the Service ID (eg. `spark-one`). This will match the slug in the topic.

`type` is a constant string, used to verify events.

`data` contains a snapshot of service, controller, and block data.
When the service shuts down or loses connection to the eventbus,
a message will be published where `data` is null.

`data.status` describes the currently connected controller (if any), and whether it is compatible with the service. More on this below.

`data.blocks` lists all blocks on the controller.
The interfaces for all block types are documented [here](./block_types.md).

`data.relations` and `data.claims` contain calculated block metadata.
Relations can be used to graph the links between blocks,
and claims indicate active control chains.

## Spark status

<<< @/node_modules/brewblox-proto/ts/spark-service-types.ts#SparkDescription

For the system to function, the service and controller must be using the same communication and messaging protocols.
The service is built to match a specific firmware version,
and checks the actual firmware version during the connection process.

If the expectation is incompatible with the reality,
the connection process is stopped before blocks can be read or written.

<<< @/node_modules/brewblox-proto/ts/spark-service-types.ts#SparkStatusDescription

Expected and actual firmware properties are both included in the Spark status,
along with the current state of the connection process.

First, the service attempts to connect to a controller.
This process is described in the [Spark connection settings guide](../../user/services/spark.md#spark-connection-settings).

After the service is connected, the state becomes `CONNECTED`, and the service starts prompting the controller to send a handshake message. This is a plaintext string with firmware and device information. The contents are stored in the `status.controller` field.

Once the handshake is received, the connection state becomes `ACKNOWLEDGED`.
If the service is incompatible with the controller, the process stops here.
Otherwise, it will proceed to the synchronization step.

Some examples:

- Setting the controller date/time.
- Setting the controller time zone.
- Setting the controller display units (Celsius or Fahrenheit).
- Getting block names from the datastore.

Once this is done, the connection state becomes `SYNCHRONIZED`.
The service will now read/write blocks on the controller.

## Block relations

<<< @/node_modules/brewblox-proto/ts/spark-service-types.ts#BlockRelation

Relevant links between blocks are analyzed, and published as part of the service state.
The relations can be used to map the active control chains.
For an example of this, see the relations view on the Spark service page in the UI.

While typically the block that defines the link is considered the relation *source*, this is not guaranteed.
For example, the *PID* block has a link to its input *Setpoint*,
but for the purposes of the control chain, the Setpoint is considered the source, and the PID the target.

## Claims

<<< @/node_modules/brewblox-proto/ts/spark-service-types.ts#BlockClaim

When one block is actively and exclusively controlling another block, this is referred to as a *claim*.
Claiming blocks may in turn be claimed by another block (a *Digital Actuator* is claimed by a *PWM* which is claimed by a *PID*).

These claims are analyzed, and published as part of the service state.
A *BlockClaim* is generated for every combination of claimed block and initial claimer (a claiming block that is not claimed itself).

Given a typical fermentation control scheme with these blocks...

- Heat PID
- Heat PWM
- Heat Actuator
- Cool PID
- Cool PWM
- Cool Actuator
- Spark Pins

...the following *BlockClaim* objects will be generated

- target=Spark Pins, source=Heat PID, intermediate=[Heat Actuator, Heat PWM]
- target=Heat Actuator, source=Heat PID, intermediate=[Heat PWM]
- target=Heat PWM, source=Heat PID, intermediate=[]
- target=Spark Pins, source=Cool PID, intermediate=[Cool Actuator, Cool PWM]
- target=Cool Actuator, source=Cool PID, intermediate=[Cool PWM]
- target=Cool PWM, source=Cool PID, intermediate=[]

## Spark patch events

Whenever a single block is changed or removed, a patch event is published. Patch events implicitly modify the last published Spark state event.

Clients are free to ignore patch events, and wait for the next published Spark state event.

Patch events are published to the `brewcast/state/<Service ID>/patch` topic.

<<< @/node_modules/brewblox-proto/ts/spark-service-types.ts#SparkPatchEvent

`key` is always set to the Service ID (eg. `spark-one`). This will match the slug in the topic.

`type` is a constant string, used to verify events.

`data.changed` will be a list of [blocks](./block_types.md) where settings were changed since the last state event.
Changes to sensor values will not trigger a patch event.

`data.deleted` is a list of block IDs matching blocks that were removed since the last state event.

## Spark update events

During firmware updates, progress is published using state events.
This does not apply to firmware updates triggered by `brewblox-ctl flash`.

Update progress events are published to the `brewcast/state/<Service ID>/update` topic.

<<< @/node_modules/brewblox-proto/ts/spark-service-types.ts#SparkUpdateEvent

`key` is always set to the Service ID (eg. `spark-one`). This will match the slug in the topic.

`type` is a constant string, used to verify events.

`data.log` contains new progress messages.
