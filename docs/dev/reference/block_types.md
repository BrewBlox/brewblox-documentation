# Block data types

This page describes the interface specs for all block types.

The block type ID may vary slightly from the type name displayed in the UI.

Block data is serialized as JSON, and will not include classes, functions, or other non-serializable types.

The [TypeScript interface syntax](https://www.typescriptlang.org/docs/handbook/interfaces.html) is used to define types, with the exception of enums, for which the [typescript-string-enums](https://github.com/dphilipson/typescript-string-enums) library is used.

## Block (base type)

*Block* is the base type for all blocks.
The shared fields are defined here, and each block type extends this interface with more specific typings for `type` and `data`.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#Block

## Block interfaces

Blocks may implement one or more interface types.
Links within blocks can declare an interface type instead of a block type.
All blocks that implement said interface are valid targets for the link.

<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#COMPATIBLE_TYPES

## BloxField (typed objects)

Some block fields require metadata to be interpreted.
They are serialized as typed objects so that clients can automatically recognize and parse this metadata.

BloxField objects are identified by having the `__bloxtype` field.
The value for this field identifies the subtype.

Brewblox currently supports two subtypes: *Quantity*, and *Link*.

Quantity objects have a value and unit.
When reading data, the value is converted to the user's preferred unit.
When writing data, the value is converted to the controller's preferred unit.

Link objects are fields in block data that refer to other blocks.
Each link field has a fixed type.
This can be a block type (*Pid*), but also a block interface type (*TempSensorInterface*).

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#BloxField

## DateString (datetime handling)

Datetime fields are serialized to JSON using the [ISO 8601](https://en.wikipedia.org/wiki/ISO_8601) format.

JSON-wise, this is just a string. For block data types,
we added the `DateString` alias to make it obvious that a given field will always contain an ISO 8601 formatted date.

When writing block data, dates with non-UTC timezones can be used,
but the controller will always return dates with UTC timezones.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#DateString

## IoChannel

An IoChannel is the software representation of a group of IO pins.
Channels are provided by blocks that implement *IoArray*, and are used by digital actuators.

*DS2408*, *DS2413*, *Spark2Pins*, *Spark3Pins*, *MockPins*, *OneWireGpioModule* all implement *IoArray*.

By default, channels are constant and cannot be modified.
There are two exceptions:

- *OneWireGpioModule* channels are completely user-defined
- *DS2408* will report different channels based on the value of its `connectMode` field (valve or actuator).

*DigitalActuator* and *MotorValve* blocks use channels as output. This is configured as a combination of a link to to an *IoArray* block, and a `channel` or `startChannel` field.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#IoChannel

## Constraints

Various types of constraints can be set on blocks to modify their output.

Constraints are split in two groups: digital constraints, and analog constraints.

Digital actuators (*DigitalActuator*, *MotorValve*) have digital constraints, and analog actuators (*AnalogActuatorMock*, *ActuatorOffset*, *ActuatorPwm*) have analog constraints.

Typically, actuators have a *desiredSetting* and a *setting* field.
*desiredSetting* is the before, and *setting* is after constraints are evaluated.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#Constraints

## ActuatorAnalogMock

This block can be used as a dummy replacement for an *ActuatorPwm*,
or as input block for an *ActuatorLogic*.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#ActuatorAnalogMock

## ActuatorLogic

Evaluates a boolean expression to get a true/false result.
Drives a *DigitalActuator* - state is set to match the evaluation result.

The expression may contain references to digital or analog comparisons.
For a detailed explanation, see the [Blocks guide](../../user/all_blocks.md).

All expressions are assigned a letter based on their type and array index.

*DigitalCompare* objects are lettered `a` through `z`,
and *AnalogCompare* objects are lettered `A` through `Z`.

If a compare is removed from the array, the letter designation of all
subsequent compares will shift.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#ActuatorLogic

Referenced enum values:

<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#Logic

## ActuatorOffset (Setpoint Driver)

The *ActuatorOffset* sets a target block setting to that of a reference block plus offset.

Offset is either set manually, or determined by a PID.

Both target and reference blocks can be either a Setpoint, or an analog actuator (PWM).
If a Setpoint is used, values are always in degrees Celsius.

The "setting" has three intermediate stages:

*desiredSetting* is set manually or by a PID.
This is the desired offset between reference and target.

*setting* is the actual setting.
Constraints are evaluated, and the reference setting is added.

If *desiredSetting* is 10, and reference setting is 50, then *setting* will be 60.

*value* is the actual achieved offset between reference setting and target value.

If *desiredSetting* is 10, reference setting is 50,
and measured value of target block is 55,
then *value* will be 5.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#ActuatorOffset

Referenced enum values:

<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#ReferenceKind

## ActuatorPwm

The *ActuatorPwm* converts an analog 0-100 setting to timed ON/OFF instructions.
The percentage of time spent ON will match the analog setting.

It drives a digital actuator, and has analog constraints.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#ActuatorPwm

## Balancer

The *Balancer* fairly grants output to multiple analog actuators,
based on their desired setting.

It is linked to an actuator using the *Balanced* analog constraint.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#Balancer

## DeprecatedObject

*DeprecatedObject* blocks are stub object: the block itself exists, but the type is no longer supported.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#DeprecatedObject

## DigitalActuator

Turns an *IoChannel* ON or OFF.

The actuator itself is typically driven by a PWM, and supports digital constraints.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#DigitalActuator

Referenced enum values:

<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#DigitalState

## DisplaySettings

**System object**

Controls the Spark LCD screen,
and has its own independent temperature unit setting.

*widgets* is an array of at most 6 slots.
Slots can be set in any order. The *pos* field determines the on-screen position.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#DisplaySettings

Referenced enum values:

<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#DisplayTempUnit

## DS2408

**Discovered object**

*DS2408* provides *IoChannel* objects for valves or actuators.

Valves and actuators should not be mixed, as they make different use of the available pins.
Based on the value of the *connectMode* field, different IO channels are available.

In actuator mode, channels 1-8 can be used.
In valve mode, (start) channels 1 and 5 are available.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#DS2408

Referenced enum values:

<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#DS2408ConnectMode

Channel mapping:

```js
{
  [DS2408ConnectMode.CONNECT_ACTUATOR]: {
    1: 'A',
    2: 'B',
    3: 'C',
    4: 'D',
    5: 'E',
    6: 'F',
    7: 'G',
    8: 'H',
  },
  [DS2408ConnectMode.CONNECT_VALVE]: {
    1: 'B',
    5: 'A',
  },
}
```

## DS2413

**Discovered object**

*DS2408* provides *IoChannel* objects for digital actuators.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#DS2413

Channel mapping:

```js
{
  1: 'A',
  2: 'B',
}
```

## InactiveObject

**Deprecated**

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#InactiveObject

## MockPins

*MockPins* provides dummy *IoChannel* objects for digital actuators.

This is useful for simulator services,
but also for use in *ActuatorLogic* configurations where a digital actuator is only used as input, and is not expected to control hardware.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#MockPins

Channel mapping:

```js
{
  1: 'A',
  2: 'B',
  3: 'C',
  4: 'D',
  5: 'E',
  6: 'F',
  7: 'G',
  8: 'H',
}
```

## MotorValve

*MotorValve* is a special kind of digital actuator.

It must be connected to a *DS2408*, and technically requires 4 IO channels to function.

The start channel is configured, and it will automatically claim the next three channels.
To make this explicit, *DS2408* only reports valid start channels when set to valve mode.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#MotorValve

Referenced enum values:

<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#DigitalState
<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#ValveState

## Mutex

*Mutex* ensures that multiple digital actuators will never be active simultaneously.

It is configured by setting a *Mutexed* constraint on two or more digital actuators.

If *extraHoldTime* is set in a mutexed constraint,
it will override the *differentActuatorWait* value.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#Mutex

## OneWireBus

**System object**

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#OneWireBus

## OneWireGpioModule

**Discovered object**

*OneWireGpioModule* is the software representation of a Spark 4 GPIO module.
There will be one block per attached module, up to a maximum of 4.

In contrast with other *IoArray* blocks, all channels are user-defined.

*GpioModuleChannel* objects define a pin mask to claim 0-8 of the available pins.
The number of claimed pins should be either 0, or match the value of `GpioModuleChannel.width`.
Only continuous blocks of pins can be claimed for a single channel, and channels cannot overlap.

If no pins are claimed, the channel is still a valid target for a digital actuator.

The `GpioModuleStatus` and `GpioPins` enums are [8-bit masks](https://basarat.gitbook.io/typescript/type-system/enums#number-enums-as-flags).

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#OneWireGpioModule

Referenced enum values:

<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#Gpio

## Pid

*Pid* reads a *SetpointSensorPair* setting and measured value,
and calculates desired output for an analog actuator.

For a more in-depth explanation of how to use it, see the [blocks guide](../../user/all_blocks.md).

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#Pid

Referenced enum values:

<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#FilterChoice

## Sequence

*Sequence* implements bare-bones automation behavior, by running a sequential set of instructions.
Instructions either set a value, or wait for a condition to be true.
Combined, they can be used to to augment the *SetpointProfile* block or implement if-this-then-that functionality.

Active state (`activeInstruction`, `activeInstructionStartedAt`, `disabledAt`, `disabledDuration`) are readonly unless `overrideState` is set to `true` in a write or patch command.

Client-side, sequence instructions are edited using a line protocol.
For syntax, and available instructions, see the [sequence instructions page](./sequence_instructions.md).

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#Sequence

Referenced enum values:

<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#SequenceStatus
<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#SequenceError

## SetpointProfile

The *SetpointProfile* drives a *SetpointSensorPair* to gradually change its setting over time.

For a more in-depth explanation of how to use it, see the [blocks guide](../../user/all_blocks.md).

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#SetpointProfile

## SetpointSensorPair

This is the basic Setpoint block: it has a desired setting,
and is linked to a temperature sensor.

The *storedSetting* field contains the last user-set setting.
*setting* will equal *storedSetting* unless the Setpoint is driven.

The measured value is filtered to reduce jitter, but allows setting a step threshold to improve response time if the value has a legitimate sudden change.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#SetpointSensorPair

Referenced enum values:

<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#FilterChoice

## Spark2Pins

**System object**

The *Spark2Pins* object is only found on Spark 2 controllers,
and provides an array of *IoChannel* objects.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#Spark2Pins

Referenced enum values:

<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#Spark2Hardware

Channel mapping:

```js
{
  1: 'Bottom 1',
  2: 'Bottom 2',
  3: 'Bottom 3',
  4: 'Bottom 4',
}
```

## Spark3Pins

**System object**

The *Spark3Pins* object is only found on Spark 3 controllers,
and provides an array of *IoChannel* objects, along with settings regulating voltage.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#Spark3Pins

Channel mapping:

```js
{
  1: 'Top 1',
  2: 'Top 2',
  3: 'Top 3',
  4: 'Bottom 1',
  5: 'Bottom 2',
}
```

## SysInfo

**System object**

Basic device info can be found here.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#SysInfo

Referenced enum values:

<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#SparkPlatform

## TempSensorCombi

Accepts other temp sensors as input, and sets value to average/min/max of all connected sensors.
Disconnected or unknown sensors are ignored.

A maximum of 8 sensors can be set.
A TempSensorCombi can use other TempSensorCombi blocks as input.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#TempSensorCombi

Referenced enum values:

<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#SensorCombiFunc

## TempSensorExternal

A manually set sensor block, with added safety for unreliable sources.
The `enabled` and `timeout` fields are persistent,
but `setting` must be written regularly for the sensor to remain valid.

`value` will become invalid if `enabled` is false, or more than `timeout` has elapsed since the last time `setting` was written.

This timeout behavior can be disabled by setting the `timeout` field to 0.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#TempSensorExternal

## TempSensorMock

Can be used interchangeably with the *TempSensorOneWire* block,
except that its setting is user-defined.

Fluctuations can be configured for improved simulation of real-world conditions.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#TempSensorMock

## TempSensorOneWire

**Discovered object**

The basic temperature sensor.
An offset can be configured for calibration purposes.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#TempSensorOneWire

## Ticks

**System object**

Keeps track of system time.
*secondsSinceEpoch* is automatically set by the Spark service.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#Ticks

## TouchSettings

**System object**

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#TouchSettings

Referenced enum values:

<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#TouchCalibrated

## WiFiSettings

**System object**

Wifi setting values are write-only, and will always be empty when read.
This block is only present on Spark 2 and 3 controllers.

<<< @/node_modules/brewblox-proto/ts/spark-block-types.ts#WiFiSettings

Referenced enum values:

<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#Wifi
