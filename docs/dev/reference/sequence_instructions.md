# Sequence block instructions

reference manual for supported instructions.

## Line protocol

Unlike other block data fields, *Sequence* instructions are not represented as JSON object,
but as a line protocol.
The intention is that end users can easily read and edit the line protocol.

The basic syntax for instructions is:

```txt
OPCODE arg1=value, arg2=value ...
```

Any instruction will always have an opcode, and zero or more arguments.
All arguments must always be present.

Arguments use a comma-separated `key=value` syntax, and do not have to be listed in any particular order.
There is no comma between the opcode and the first argument.

If an instruction has arguments, they are separated from the opcode with at least one space.
Any number of spaces can be inserted next to the comma ` , ` and ` = ` separator characters.

Both instructions in the below example are equally valid.

```txt
OPCODE key1=value,key2=value
OPCODE      key1   =  value  ,   key2   = value
```

Quantities are automatically identified, and converted where required.
The output from the Spark service always returns quantities with the user-preferred units.\
Abbreviated temperature units are used: `C` or `F` for absolute values, and `dC` or `dF` for relative values.

Time duration values (such as found in `WAIT_DURATION`) can be expressed either in integer seconds, or as duration string (eg. `1d6h10m5s`).

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

## Block interfaces

Instructions that have a target block may require a block that implements a specific interface, and not a single block type.

<<< @/shared-types/spark-block-enums.ts#COMPATIBLE_TYPES

## Error states

The *Sequence* block will enter an error state if invalid configuration or system state is detected.
If the error is resolved (for example, by creating a missing target), the error state is cleared automatically.

- `INVALID_TARGET`: The target block does not exist, or is the wrong type.
- `INACTIVE_TARGET`: The target block is inactive because it depends on or is driven by a block that is missing, disabled or disconnected.
- `DISABLED_TARGET`: The target block is disabled in configuration.
- `SYSTEM_TIME_NOT_AVAILABLE`: Controller system time is not set, and the *Sequence* block can't execute any instructions.

<<< @/shared-types/spark-block-enums.ts#SequenceError

## Instructions

Below is a list of supported opcodes, their arguments, and the errors they may trigger.
The `SYSTEM_TIME_NOT_AVAILABLE` error is not listed, as it is triggered before any instruction is executed.

### RESTART

When this instruction is executed, the *Sequence* jumps back to the first instruction.
Any instructions after the `RESTART` will not be executed.

**Arguments:** N/A

**Errors:** N/A

**Example:**

```txt
RESTART
```

### ENABLE

Sets the `enabled` field for given block to `true`.

**Arguments:**

- `target`: block ID (*EnablerInterface*).

**Errors:**

- `INVALID_TARGET`

**Example:**

```txt
ENABLE target='Fridge Setting'
```

### DISABLE

Sets the `enabled` field for given block to `false`.

**Arguments:**

- `target`: block ID (*EnablerInterface*).

**Errors:**

- `INVALID_TARGET`

**Example:**

```txt
DISABLE target='Fridge Setting'
```

### WAIT_DURATION

Waits until a given duration has elapsed since the instruction was started.
If the *Sequence* is disabled while this instruction is active, time spent disabled is **not** included.\
If the controller is shut down while this instruction is active, time spent shut down is included.

**Arguments:**

- `duration`: duration (duration string, or integer seconds).

**Errors:** N/A

**Example:**

```txt
WAIT_DURATION duration=1h10m5s
```

### WAIT_UNTIL

Waits until current time is later than given time value.

**Arguments:**

- `time`: timestamp (seconds since 1/1/1970).

**Errors:** N/A

**Example:**

```txt
WAIT_UNTIL time=1656588530
```

### WAIT_TEMP_BETWEEN

Waits until the measured value of target temperature sensor is inside a temperature range.

**Arguments:**

- `target`: block ID (*TempSensorInterface*).
- `lower`: absolute temperature value.
- `upper`: absolute temperature value.

**Errors:**

- `INVALID_TARGET`
- `INACTIVE_TARGET`

**Example:**

```txt
WAIT_TEMP_BETWEEN target='Fridge Sensor', lower=1C, upper=5C
```

### WAIT_TEMP_NOT_BETWEEN

Waits until the measured value of target temperature sensor is outside a temperature range.
The sensor must be connected and readable for this instruction to finish.

**Arguments:**

- `target`: block ID (*TempSensorInterface*).
- `lower`: absolute temperature value.
- `upper`: absolute temperature value.

**Errors:**

- `INVALID_TARGET`
- `INACTIVE_TARGET`

**Example:**

```txt
WAIT_TEMP_NOT_BETWEEN target='Fridge Sensor', lower=1C, upper=5C
```

### WAIT_TEMP_UNEXPECTED

Waits until the measured value of target temperature sensor is unreadable or outside a temperature range.

Compared to `WAIT_TEMP_NOT_BETWEEN`, this condition is more suitable for alerts, as it will not cause an error state if the sensor is disconnected.

**Arguments:**

- `target`: block ID (*TempSensorInterface*).
- `lower`: absolute temperature value.
- `upper`: absolute temperature value.

**Errors:**

- `INVALID_TARGET`

**Example:**

```txt
WAIT_TEMP_UNEXPECTED target='Fridge Sensor', lower=1C, upper=5C
```

### WAIT_TEMP_ABOVE

Waits until the measured value of target temperature sensor is above a given value.
The sensor must be connected and readable for this instruction to finish.

**Arguments:**

- `target`: block ID (*TempSensorInterface*).
- `value`: absolute temperature value.

**Errors:**

- `INVALID_TARGET`
- `INACTIVE_TARGET`

**Example:**

```txt
WAIT_TEMP_ABOVE target='Fridge Sensor', value=10C
```

### WAIT_TEMP_BELOW

Waits until the measured value of target temperature sensor is below a given value.

**Arguments:**

- `target`: block ID (*TempSensorInterface*).
- `value`: absolute temperature value.

**Errors:**

- `INVALID_TARGET`
- `INACTIVE_TARGET`

**Example:**

```txt
WAIT_TEMP_BELOW target='Fridge Sensor', value=10C
```

### SET_SETPOINT

Sets the desired setting of a *Setpoint* block.

**Arguments:**

- `target`: block ID (*SetpointSensorPair*).
- `setting`: absolute temperature value.

**Errors:**

- `INVALID_TARGET`

**Example**

```txt
SET_SETPOINT target='Fridge Setting', value=40F
```

### WAIT_SETPOINT

Waits until the measured value of a *Setpoint* block is close enough to its desired setting.
The `precision` argument is not centered on the desired setting:
the instruction will finish if either `value >= setting - precision` or `value <= setting + precision` is true.

**Arguments:**

- `target`: block ID (*SetpointSensorPair*).
- `precision`: relative temperature value.

**Errors:**

- `INVALID_TARGET`
- `DISABLED_TARGET`
- `INACTIVE_TARGET`

**Example:**

```txt
WAIT_SETPOINT target='Fridge Setting', precision=0.1dC
```

### SET_DIGITAL

Sets the desired setting of target *DigitalActuator* block.

**Arguments:**

- `target`: block ID (*DigitalActuator*).
- `setting`: desired setting (*DigitalState*).

<<< @/shared-types/spark-block-enums.ts#DigitalState

**Errors:**

- `INVALID_TARGET`

**Example:**

```txt
SET_DIGITAL target='Cool Actuator', setting=STATE_ACTIVE
```

### WAIT_DIGITAL

Waits until the achieved value of target *DigitalActuator* block matches its desired setting.

**Arguments:**

`target`: block ID (*DigitalActuator*).

**Errors:**

- `INVALID_TARGET`

**Example:**

```txt
WAIT_DIGITAL target='Cool Actuator'
```

### SET_PWM

Sets the desired setting of target *ActuatorPwm* block.

**Arguments:**

- `target`: block ID (*ActuatorPwm*).
- `setting`: desired setting (0-100).

**Errors:**

- `INVALID_TARGET`

**Example:**

```txt
SET_PWM target='Cool PWM', setting=50
```

### START_PROFILE

(Re)starts a target *SetpointProfile* block by setting its `start` field to the date and time at which this instruction is executed.
The target block `enabled` state is not changed. To start a disabled *SetpointProfile*, the `ENABLE` and `START_PROFILE` instructions should be used in combination.

**Arguments:**

- `target`: block ID (*SetpointProfile*).

**Errors:**

- `INVALID_TARGET`

**Example:**

```txt
START_PROFILE target='Fridge Profile'
ENABLE target='Fridge Profile'
```

### WAIT_PROFILE

Waits until the last point is reached in target *SetpointProfile* block.

**Arguments:**

- `target`: block ID (*SetpointProfile*)

**Errors:**

- `INVALID_TARGET`
- `DISABLED_TARGET`

**Example:**

```txt
WAIT_PROFILE target='Fridge Profile'
```

### START_SEQUENCE

(Re)starts a target *Sequence* block by setting its `activeInstruction` field to 0.
The target block `enabled` state is not changed. To start a disabled *Sequence*, the `ENABLE` and `START_SEQUENCE` instructions should be used in combination.

**Arguments:**

- `target`: block ID (*Sequence*).

**Errors:**

- `INVALID_TARGET`

**Example:**

```txt
START_SEQUENCE target='Mash Sequence'
ENABLE target='Mash Sequence'
```

### WAIT_SEQUENCE

Waits until the target *Sequence* block has reached the `END` state.
A *Sequence* that includes a `RESTART` instruction will never reach an `END` state.

**Arguments:**

- `target`: block ID (*Sequence*).

**Errors:**

- `INVALID_TARGET`
- `DISABLED_TARGET`

**Example:**

```txt
WAIT_SEQUENCE target='Mash Sequence'
```
