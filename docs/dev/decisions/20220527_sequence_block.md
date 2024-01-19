# Sequence Block

Date: 2022/05/27

## Context

[The automation replacements decision](./20211123_automation_replacements.md) discussed the implementation of a new block for setting and waiting for setpoint values.
This document describes the design and implementation of this block.

## Use case

A common control scenario is to **set** a desired setting, and then **wait** until a condition is met. This behavior may be chained.

Existing blocks either only offer singular conditional actions (*Logic Actuator*), or are completely predetermined (*Setpoint Profile*).

The desired behavior is completely dependent on existing blocks, can function autonomously, and has a high cost of failure.
In combination, this means that the most appropriate solution is to implement it by creating a new block type on the controller: the *Sequence* block.

## Architecture

The desired behavior can be expressed as a sequential set of independent instructions.\
Any given instruction either:

- **sets** a block setting on a given block.
- **waits** for a condition to be true.

The majority of instructions requires one or more arguments. Typically this consists of the target block ID, and the desired value.

Instructions are always executed serially in order of definition.
More complication functionality can be achieved by having the *Sequence* block trigger *Setpoint Profile* blocks or other *Sequence* blocks.
This allows for rudimentary branching behavior.

Both settings and conditions are too diverse to be captured by generic "set" and "wait" instructions, so specific instructions per block type (or interface) and field are required.

### Instructions

- **RESTART**: reset `activeInstruction` to 0.
- **ENABLE**: enable target block.
- **DISABLE**: disable target block.
- **WAIT_DURATION**: wait until given duration has elapsed since the instruction was first called.
- **WAIT_UNTIL**: wait until current time in UTC is later than given value.
- **WAIT_TEMP_BETWEEN**: wait until target *Temperature Sensor* block value is between an upper and lower bound.
- **WAIT_TEMP_NOT_BETWEEN**: wait until target *Temperature Sensor* block value is outside an upper and lower bound.
- **WAIT_TEMP_UNEXPECTED**: wait until target *Temperature Sensor* block value is outside an upper and lower bound, or the sensor can not be read.
- **WAIT_TEMP_ABOVE**: wait until target *Temperature Sensor* block value is above a given value.
- **WAIT_TEMP_BELOW**: wait until target *Temperature Sensor* block value is below a given value.
- **SET_SETPOINT**: set the desired setting for target *Setpoint* block.
- **WAIT_SETPOINT**: wait until desired setting was reached for target *Setpoint* block.
- **SET_DIGITAL**: set the desired state for target *Digital Actuator* or *Motor Valve* block.
- **WAIT_DIGITAL**: wait until achieved state matches desired state for target *Digital Actuator* or *Motor Valve* block.
- **SET_PWM**: set the desired setting for target *PWM* block.
- **START_PROFILE**: set start time of target *Setpoint Profile* block to now.
- **WAIT_PROFILE**: wait until the last point in target *Setpoint Profile* block is reached.
- **START_SEQUENCE**: reset target *Sequence* block to its first instruction.
- **WAIT_SEQUENCE**: wait until target *Sequence* block has completed its last instruction.

### Arguments

- **RESTART**
  - (None)
- **ENABLE**
  - target (supportsEnabledInterface block ID)
- **DISABLE**
  - target (supportsEnabledInterface block ID)
- **WAIT_DURATION**
  - duration (Duration)
- **WAIT_UNTIL**
  - time (Seconds since 1970-1-1)
- **WAIT_TEMP_BETWEEN**
  - target (TempSensorInterface block)
  - lower (Temp)
  - upper (Temp)
- **WAIT_TEMP_NOT_BETWEEN**
  - target (TempSensorInterface block)
  - lower (Temp)
  - upper (Temp)
- **WAIT_TEMP_UNEXPECTED**
  - target (TempSensorInterface block)
  - lower (Temp)
  - upper (Temp)
- **WAIT_TEMP_ABOVE**
  - target (TempSensorInterface block)
  - value (Temp)
- **WAIT_TEMP_BELOW**
  - target (TempSensorInterface block)
  - value (Temp)
- **SET_SETPOINT**
  - target (Setpoint block ID)
  - setting (Temp)
- **WAIT_SETPOINT**
  - target (Setpoint block ID)
  - precision (Delta Temp)
- **SET_DIGITAL**
  - target (ActuatorDigitalInterface block ID)
  - setting (Digital State)
- **WAIT_DIGITAL**
  - target (ActuatorDigitalInterface block ID)
- **SET_PWM**
  - target (ActuatorPwm block ID)
  - setting (number 0-100)
- **START_PROFILE**
  - target (SetpointProfile block ID)
- **WAIT_PROFILE**
  - target (SetpointProfile block ID)
- **START_SEQUENCE**
  - target (Sequence block ID)
- **WAIT_SEQUENCE**
  - target (Sequence block ID)

### Status

Instructions can modify the *Sequence* block's status when called.
If an error status is set, the active instruction will be re-evaluated until the error is cleared - either automatically, or by a configuration change.

- **DISABLED**: the block is globally disabled.
- **PAUSED**: the block is disabled during execution. `disabledDuration` will accumulate.
- **NEXT**: the last called instruction completed normally.
- **WAIT**: the active instruction determined that the required condition was not met.
- **END**: all instructions were completed normally.
- **RESTART**: the last called instruction was a RESTART instruction.
- **ERROR**: the active instruction could not be executed. The error field will be non-default.

Error status values are:

- **NONE**: no error.
- **INVALID_ARGUMENT**: one or more of the arguments for the active instruction is invalid.
- **INVALID_TARGET**: the block targeted by the active instruction does not exist, or is of an incompatible type.
- **INACTIVE_TARGET**: the block targeted by the active instruction is invalid (disconnected from hardware) or inactive (driven by a disabled block).
- **DISABLED_TARGET**: the active instruction is awaiting a status change on a disabled block.
- **SYSTEM_TIME_NOT_AVAILABLE**: controller system time is not yet set.

### State

Writable persistent settings are:

- `instructions: Instruction[]`
- `enabled: boolean`
- `overrideState: boolean`

State settings are normally read-only, unless `overrideState` is set.
In that case, they are treated as writable:

- `activeInstruction: number`
- `activeInstructionStartedAt: number`
- `disabledAt: number`
- `disabledDuration: number`

Read-only volatile settings are:

- `status: SequenceStatus`
- `error: SequenceError`

Unlike most other blocks, the *Sequence* block cannot completely derive its current setting from user-defined configuration.\
To correctly resume after a controller reboot, it must keep track of its current instruction (`activeInstruction`), and the time at which the current instruction was started (`activeInstructionStartedAt`).

These settings are automatically persisted to EEPROM whenever a new instruction is called.
To avoid race conditions, `activeInstruction`, and `activeInstructionStartedAt` are not normally writable.
To explicitly reset or restart a *Sequence*, the `overrideState` flag must be included.

To avoid `WAIT_DURATION` instructions including time spent disabled, the `disabledAt` and `disabledDuration` fields are present.\
If the *Sequence* block is disabled during execution, `disabledAt` is set to the current system time.
When the block is re-enabled, `disabledDuration` is increased with `systemTime - disabledAt`.
`disabledDuration` is always reset to 0 when the next instruction starts, or the active instruction is reset.

## Limitations

### Features

*Sequence* block instructions are mutually independent.
This precludes the implementation of a jump (required for functions, and conditional statements), and the use of variables in arguments.

This is intentional. There is a wide gulf between trivial implementations (such as the proposed *Sequencer*), and full-fledged programming languages.
In this gulf, any features added to the trivial implementation only provide marginal value until all other features required for a programming language are implemented as well.

There is added value in implementing a scripting language interpreter in firmware, but this is best served by implementing a pre-existing solution such as Lua, micro-Python, or AWK, and not by creating a new home-made DSL.

### System time

The **WAIT_DURATION**, and **WAIT_UNTIL** instructions in the *Sequence* block track time elapsed, as measured in seconds since UTC.\
The `activeInstructionStartedAt` is expressed in seconds since UTC.
If this value is not known because system time was not yet set,
the *Sequence* block cannot function.

The system time is fetched from an NTP server if a network connection is available, and always set by the Spark service upon connection.
With this in mind, the risk of malfunction is acceptable.

## Syntax

In the JSON block representation, instructions can be elegantly expressed using a list of strings.
This improves manual editability if so required.

The syntax is `{INSTRUCTION} {ARGS...}`, with one instruction per line.
Arguments use a comma-separated `key=value` syntax, and are never optional. The order of arguments is free.

The arguments are separated from the instruction with at least one space.
If there are no arguments, this space can be omitted.
Any number of spaces can be inserted next to the comma ` , ` and ` = ` separator characters.

Both instructions in the below example are equally valid

```txt
INSTRUCTION key1=value,key2=value
INSTRUCTION      key1   =  value  ,   key2   = value
```

Quantities are automatically identified, and converted where required.
The output from the Spark service always returns quantities with the user-preferred units.\
Abbreviated temperature units are used: `C` or `F` for absolute values, and `dC` or `dF` for relative values.

Time duration values (such as found in WAIT_DURATION) can be expressed either in integer seconds, or as duration string (eg. `1d6h10m5s`).

If any argument is a string that contains trailing or leading spaces, it must be quoted using single quotes.
For all other arguments, quotes are allowed but optional.

Example instructions:

```txt
SET_SETPOINT target=BK Setpoint, setting=65C
ENABLE target='BK Setpoint'
WAIT_SETPOINT target='BK Setpoint', precision=1dC
START_PROFILE target='BK Profile '
ENABLE target='BK Profile'
WAIT_PROFILE target='BK Profile '
```

Example JSON block (writable settings only):

```json
{
  "id": "BK Sequence",
  "serviceId": "spark-one",
  "type": "Sequence",
  "data": {
    "enabled": true,
    "instructions": [
      "SET_SETPOINT target=BK Setpoint, setting=65C",
      "ENABLE target='BK Setpoint'",
      "WAIT_SETPOINT target='BK Setpoint', precision=1dC",
      "START_PROFILE target='BK Profile '",
      "ENABLE target='BK Profile'",
      "WAIT_PROFILE target='BK Profile '",
    ]
  }
}
```

## Further work

During implementation, more use cases were identified as being valuable follow-up features:

- An externally-driven temperature sensor.
- An externally-driven raw sensor (unitless value).
- A START_ALARM instruction.
- A WAIT_INPUT instruction, coupled with GPIO input pins.
- Cron-style interval wait commands (once every day/hour/minute).
- A protobuf field notation for abs time fields, so they can be automatically converted between ISO-8601 syntax and seconds since epoch.
