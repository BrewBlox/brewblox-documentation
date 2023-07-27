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

Lines that start with a `#` are comments, and will not be executed.
Comments are stored on the Spark, and may cause it to run out of memory.

Example instructions:

```txt
SET_SETPOINT target=BK Setpoint, setting=65C
ENABLE target='BK Setpoint'
WAIT_SETPOINT target='BK Setpoint', precision=1dC
# Starting the profile sets its start time to 'now'
START_PROFILE target='BK Profile '
ENABLE target='BK Profile'
WAIT_PROFILE target='BK Profile '
```

## Block interfaces

Instructions that have a target block may require a block that implements a specific interface, and not a single block type.

<<< @/node_modules/brewblox-proto/ts/spark-block-const.ts#COMPATIBLE_TYPES

## Error states

The *Sequence* block will enter an error state if invalid configuration or system state is detected.
If the error is resolved (for example, by creating a missing target), the error state is cleared automatically.

- `INVALID_TARGET`: The target block does not exist, or is the wrong type.
- `INACTIVE_TARGET`: The target block is inactive because it depends on or is driven by a block that is missing, disabled or disconnected.
- `DISABLED_TARGET`: The target block is disabled in configuration.
- `SYSTEM_TIME_NOT_AVAILABLE`: Controller system time is not set, and the *Sequence* block can't execute any instructions.

<<< @/node_modules/brewblox-proto/ts/spark-block-enums.ts#SequenceError

## Instructions

Below is a list of supported opcodes, their arguments, and the errors they may trigger.
The `SYSTEM_TIME_NOT_AVAILABLE` error is not listed, as it is triggered before any instruction is executed.

<SequenceDocumentation/>
