# Sequence Instructions

<script setup>
import SequenceDocumentation from '../../components/SequenceDocumentation.vue'
</script>

This is a reference manual for the instructions supported by the *Sequence* block.
For basic information on block types, see [here](./block_types.md).

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

Argument values may refer to a value stored in a linked *Variables* block.
For variable values, the `key=$var_name` syntax is used, where `var_name` is the name of the entry stored in the *Variables* block.

Lines prefixed with a `#` are comments, and will not be executed.
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
DISABLE target='BK Profile'
SET_SETPOINT target='BK Setpoint', setting=$bk_setting
```

## Variables

**This feature is not supported on the Spark 2 and 3**

Instruction arguments can refer to a value stored in a linked *Variables* block.
Multiple sequences can be linked to the same *Variables* block.

To refer to a variable value, use the `key=$var_name` syntax, where `var_name` is the variable name.

The argument value type must match the variable value type.
If it does not, the instruction will trigger an error.

Variables are resolved when the instruction starts.
If the linked *Variables* block is changed, the active instruction is reloaded.

## Block interfaces

Instructions that have a target block may require a block that implements a specific interface, and not a single block type.

<<< @/../node_modules/brewblox-proto/ts/spark-block-const.ts#COMPATIBLE_TYPES

## Error states

The *Sequence* block will enter an error state if invalid configuration or system state is detected.
If the error is resolved (for example, by creating a missing target), the error state is cleared automatically.

- `INVALID_TARGET`: The target block does not exist, or is the wrong type.
- `INACTIVE_TARGET`: The target block is inactive because it depends on or is driven by a block that is missing, disabled or disconnected.
- `DISABLED_TARGET`: The target block is disabled in configuration.
- `SYSTEM_TIME_NOT_AVAILABLE`: Controller system time is not set, and the *Sequence* block can't execute any instructions.
- `VARIABLES_NOT_SUPPORTED`: The instruction contains a variable, but the controller does not support the *Variables* block (Spark 2 and 3).
- `UNDEFINED_VARIABLE`: The referenced variable did not exist in the linked *Variables* block.
- `INVALID_VARIABLE`: The referenced variable was found, but was of the wrong type.

<<< @/../node_modules/brewblox-proto/ts/spark-block-enums.ts#SequenceError

## Instructions

Below is a list of supported opcodes, their arguments, and the errors they may trigger.

<SequenceDocumentation/>
