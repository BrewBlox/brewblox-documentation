# Block data types

This page describes the interface specs for all block types.

The block type ID may vary slightly from the type name displayed in the UI.

Block data is serialized as JSON, and will not include classes, functions, or other non-serializable types.

The [TypeScript interface syntax](https://www.typescriptlang.org/docs/handbook/interfaces.html) is used to define types, with the exception of enums, for which the [typescript-string-enums](https://github.com/dphilipson/typescript-string-enums) library is used.


## Block (base type)

*Block* is the base type for all blocks.
The shared fields are defined here, and each block type extends this interface with more specific typings for `type` and `data`.

<<< @/shared-types/spark-block-types.ts#Block

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

<<< @/shared-types/spark-block-types.ts#BloxField

## IoPin

Pins used by *DigitalActuator* blocks share the IoPin interface.
*DS2408*, *DS2413*, *Spark2Pins*, *Spark3Pins*, *MockPins* all provide arrays of *IoPin* objects.

*DigitalActuator* has settings for which block it uses, and the pin number in that block's array.

An *IoPin* object will only ever contain a single key/value pair.
The key is the pin name.

<<< @/shared-types/spark-block-types.ts#IoPin

Referenced enum values:

<<< @/shared-types/spark-block-enums.ts#ChannelConfig
<<< @/shared-types/spark-block-enums.ts#DigitalState

Example IoPin:

```typescript
const pin: IoPin = {
  bottom1: {
    config: 'CHANNEL_ACTIVE_HIGH',
    state: 'STATE_ACTIVE',
  },
};
```

## Constraints

Various types of constraints can be set on blocks to modify their output.

Constraints are split in two groups: digital constraints, and analog constraints.

Digital actuators (*DigitalActuator*, *MotorValve*) have digital constraints, and analog actuators (*AnalogActuatorMock*, *ActuatorOffset*, *ActuatorPwm*) have analog constraints.

Typically, actuators have a *desiredSetting* and a *setting* field.
*desiredSetting* is the before, and *setting* is after constraints are evaluated.

<<< @/shared-types/spark-block-types.ts#Constraints

## ActuatorAnalogMock

This block can be used as a dummy replacement for an *ActuatorPwm*,
or as input block for an *ActuatorLogic*.

<<< @/shared-types/spark-block-types.ts#ActuatorAnalogMock

## ActuatorLogic

Evaluates a boolean expression to get a true/false result.
Drives a *DigitalActuator* - state is set to match the evaluation result.

The expression may contain references to digital or analog comparisons.
For a detailed explanation, see the [Blocks guide](../../user/all_blocks).

All expressions are assigned a letter based on their type and array index.

*DigitalCompare* objects are lettered `a` through `z`,
and *AnalogCompare* objects are lettered `A` through `Z`.

If a compare is removed from the array, the letter designation of all
subsequent compares will shift.

<<< @/shared-types/spark-block-types.ts#ActuatorLogic

Referenced enum values:

<<< @/shared-types/spark-block-enums.ts#Logic

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

<<< @/shared-types/spark-block-types.ts#ActuatorOffset

Referenced enum values:

<<< @/shared-types/spark-block-enums.ts#ReferenceKind

## ActuatorPwm

The *ActuatorPwm* converts an analog 0-100 setting to timed ON/OFF instructions.
The percentage of time spent ON will match the analog setting.

It drives a digital actuator, and has analog constraints.

<<< @/shared-types/spark-block-types.ts#ActuatorPwm

## Balancer

The *Balancer* fairly grants output to multiple analog actuators,
based on their desired setting.

It is linked to an actuator using the *Balanced* analog constraint.

<<< @/shared-types/spark-block-types.ts#Balancer

## DeprecatedObject

*DeprecatedObject* blocks are stub object: the block itself exists, but the type is no longer supported.

<<< @/shared-types/spark-block-types.ts#DeprecatedObject

## DigitalActuator

Turns an *IoPin* ON or OFF.

The actuator itself is typically driven by a PWM, and supports digital constraints.

<<< @/shared-types/spark-block-types.ts#DigitalActuator

Referenced enum values:

<<< @/shared-types/spark-block-enums.ts#DigitalState

## DisplaySettings

**System object**

Controls the Spark LCD screen,
and has its own independent temperature unit setting.

*widgets* is an array of at most 6 slots.
Slots can be set in any order. The *pos* field determines the on-screen position.

<<< @/shared-types/spark-block-types.ts#DisplaySettings

Referenced enum values:

<<< @/shared-types/spark-block-enums.ts#DisplayTempUnit

## DS2408

**Discovered object**

*DS2408* provides *IoPin* objects for valves or actuators.

Valves and actuators should not be mixed, as they make different use of the available pins.
The *connectMode* field indicates current usage.

If the DS2408 is used by a MotorValve,
only pins 1 and 4 should be used as *startChannel* in the MotorValve block.

<<< @/shared-types/spark-block-types.ts#DS2408

Referenced enum values:

<<< @/shared-types/spark-block-enums.ts#DS2408ConnectMode

## DS2413

**Discovered object**

*DS2408* provides *IoPin* objects for digital actuators.

<<< @/shared-types/spark-block-types.ts#DS2413

## InactiveObject

**Deprecated**

<<< @/shared-types/spark-block-types.ts#InactiveObject

## Groups

**Deprecated, system object**

<<< @/shared-types/spark-block-types.ts#Groups

## MockPins

*MockPins* provides dummy *IoPin* objects for digital actuators.

This is useful for simulator services,
but also for use in *ActuatorLogic* configurations where a digital actuator is only used as input, and is not expected to control hardware.

<<< @/shared-types/spark-block-types.ts#MockPins

## MotorValve

*MotorValve* is a special kind of digital actuator.

It must be connected to a *DS2408*, and requires 4 *IoPin* channels to function.

The start channel is configured, and it will automatically claim the next three channels.

<<< @/shared-types/spark-block-types.ts#MotorValve

Referenced enum values:

<<< @/shared-types/spark-block-enums.ts#DigitalState
<<< @/shared-types/spark-block-enums.ts#ValveState

## Mutex

*Mutex* ensures that multiple digital actuators will never be active simultaneously.

It is configured by setting a *Mutexed* constraint on two or more digital actuators.

If *extraHoldTime* is set in a mutexed constraint,
it will override the *differentActuatorWait* value.

<<< @/shared-types/spark-block-types.ts#Mutex

## OneWireBus

**System object**

<<< @/shared-types/spark-block-types.ts#OneWireBus

## Pid

*Pid* reads a *SetpointSensorPair* setting and measured value,
and calculates desired output for an analog actuator.

For a more in-depth explanation of how to use it, see the [blocks guide](../../user/all_blocks).

<<< @/shared-types/spark-block-types.ts#Pid

Referenced enum values:

<<< @/shared-types/spark-block-enums.ts#FilterChoice

## SetpointProfile

The *SetpointProfile* drives a *SetpointSensorPair* to gradually change its setting over time.

For a more in-depth explanation of how to use it, see the [blocks guide](../../user/all_blocks).

<<< @/shared-types/spark-block-types.ts#SetpointProfile

## SetpointSensorPair

This is the basic Setpoint block: it has a desired setting,
and is linked to a temperature sensor.

The *storedSetting* field contains the last user-set setting.
*setting* will equal *storedSetting* unless the Setpoint is driven.

The measured value is filtered to reduce jitter, but allows setting a step threshold to improve response time if the value has a legitimate sudden change.

<<< @/shared-types/spark-block-types.ts#SetpointSensorPair

Referenced enum values:

<<< @/shared-types/spark-block-enums.ts#FilterChoice

## Spark2Pins

**System object**

The *Spark2Pins* object is only found on Spark 2 controllers,
and provides an array of *IoPin* objects.

<<< @/shared-types/spark-block-types.ts#Spark2Pins

Referenced enum values:

<<< @/shared-types/spark-block-enums.ts#Spark2Hardware

## Spark3Pins

**System object**

The *Spark3Pins* object is only found on Spark 3 controllers,
and provides an array of *IoPin* objects, along with settings regulating voltage.

<<< @/shared-types/spark-block-types.ts#Spark3Pins

## SysInfo

**System object**

Basic device info can be found here.

<<< @/shared-types/spark-block-types.ts#SysInfo

Referenced enum values:

<<< @/shared-types/spark-block-enums.ts#SparkPlatform

## TempSensorCombi

Accepts other temp sensors as input, and sets value to average/min/max of all connected sensors.
Disconnected or unknown sensors are ignored.

A maximum of 8 sensors can be set.
A TempSensorCombi can use other TempSensorCombi blocks as input.

<<< @/shared-types/spark-block-types.ts#TempSensorCombi

Referenced enum values:

<<< @/shared-types/spark-block-enums.ts#SensorCombiFunc

## TempSensorMock

Can be used interchangeably with the *TempSensorOneWire* block,
except that its setting is user-defined.

Fluctuations can be configured for improved simulation of real-world conditions.

<<< @/shared-types/spark-block-types.ts#TempSensorMock

## TempSensorOneWire

**Discovered object**

The basic temperature sensor.
An offset can be configured for calibration purposes.

<<< @/shared-types/spark-block-types.ts#TempSensorOneWire

## Ticks

**System object**

Keeps track of system time.
*secondsSinceEpoch* is automatically set by the Spark service.

<<< @/shared-types/spark-block-types.ts#Ticks

## TouchSettings

**System object**

<<< @/shared-types/spark-block-types.ts#TouchSettings

Referenced enum values:

<<< @/shared-types/spark-block-enums.ts#TouchCalibrated

## WiFiSettings

**System object**

Wifi setting values are write-only, and will always be empty when read.

<<< @/shared-types/spark-block-types.ts#WiFiSettings

Referenced enum values:

<<< @/shared-types/spark-block-enums.ts#Wifi
