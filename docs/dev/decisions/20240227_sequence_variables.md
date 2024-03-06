# Sequence Variables

Date: 2024/02/27

## Context

The [Sequence block](./20220527_sequence_block.md) provides an API for basic scripting control over block settings.
The block has proven useful for a wide range of use cases, and would benefit from further development.

The Sequence API is intentionally very limited.
If full scripting functionality is required, the correct implementation is to use an existing scripting language, not to hand-roll our own.
In practical terms, this means two major language features are absent: branching, and variables.

Branching is considered incompatible with the declared scope for the Sequence block.
The syntax would either require inter-dependent if/else statements, or assembly-like stack push/pop operations.
Neither is desirable for a user-facing API.

Variables do not require inter-dependent statements or a major shift in how instructions are evaluated and executed.

## Requirements

There are five functional requirements for the implementation:

- Variables are identified using a human-readable key.
- Values are stored on the controller.
- Variables can be shared by multiple sequences.
- Variables can be declared or changed without changes to the consuming sequences.
- Variables can be declared, changed, or removed while the consuming sequences are active.

The non-functional requirements are:

- Stored size is minimal
- Binary size is minimal

## Implementation architecture

Because variables can be shared by multiple sequences, they are implemented as a separate *Variables* block.

The Variables block will not be supported on the Spark 2/3.
Early estimates indicated that the remaining disk space in the firmware partition would not be enough for any implementation.
We may revisit this decision if we free up disk space at a later date.

If a sequence on a Spark 2/3 controller encounters a variable, this is considered an error state.
This behavior is platform-dependent logic, and should be implemented using a compile-time switch.

## Variable declaration and definition

Variables are declared in two locations: the *Variables* block, and in individual sequence instructions,
but only ever defined in the *Variables* block.

We may introduce a SET_VARIABLE instruction in a later update, but it will not be part of the initial implementation.

## Resolving variables

Variables are resolved when the sequence transitions to a new instruction or when the linked Variables block is updated.
Sequence state is preserved, and the active instruction is not considered to have restarted when variables are re-resolved.
This prevents WAIT_DURATION instructions to be extended by unrelated changes to the linked *Variables* block.

Synchronization between the *Sequence* and *Variables* block is done with a simple uint32 counter value.
Whenever the *Variables* block is updated, it increments its counter.
The *Sequence* block keeps a copy of the counter value, and compares it every update.
If the two values are different, the active instruction is reloaded.

If a variable referenced by a sequence instruction cannot be resolved, this is an error, but not a fatal one.
Three new sequence errors are introduced to account for the new potential states:

- VARIABLES_NOT_SUPPORTED: variable is present in an instruction run by a Spark 2/3
- UNDEFINED_VARIABLE: no *Variables* block linked, or no value was found for variable name
- INVALID_VARIABLE: variable exists, but its type is different to that required by the instruction argument

## Protobuf encoding - variables

Variable names are human-defined for both the *Variables* block and consuming sequences.
Their names are resolved at runtime, and cannot be stored external to the firmware.

Nanopb requires callback-based encoding/decoding for generic string types, but uses `char[]` for string types with a fixed size.
Both to reduce encoding complexity, and to safeguard against unexpected memory issues, the fixed size alternative is preferable.

The compromise between UX and efficiency is estimated to be in the 16-32 range for max size.
Any increases to max size are backwards compatible, but decreases are not.
For this reason, the initial implementation requires variable names to be max 16 characters.
If this proves to be insufficient, we can increase this limit in a later update.

To prevent parsing conflicts, variable name requirements are kept strict: `A-Z`, `a-z`, `0-9`, and `_-`.

Value types are static, and limited to those used by sequence instructions.

- digital state
- analog value
- temperature
- delta temperature
- timestamp
- duration
- link

Link types are not further sub-divided by type or interface.
Instructions can refer to the same block while resolving it to a different interface.
The firmware already has built-in safety mechanisms to avoid unsafe access to link types.

A special extra case is added: `bool empty`. This is used to remove variables in patch commands.
If a variable is written of `empty` type, any existing entry with the same key will be removed.
The firmware will never include `empty` type variables in return values.

```proto
message VarContainer {
  oneof var {
    bool empty = 1;

    IoArray.DigitalState digital = 10;
    sint32 analog = 11
        [ (brewblox.field).scale = 4096, (nanopb).int_size = IS_32 ];

    sint32 temp = 20 [
      (brewblox.field).unit = Celsius,
      (brewblox.field).scale = 4096,
      (nanopb).int_size = IS_32
    ];
    sint32 deltaTemp = 21 [
      (brewblox.field).unit = DeltaCelsius,
      (brewblox.field).scale = 4096,
      (nanopb).int_size = IS_32
    ];

    uint32 timestamp = 30
        [ (brewblox.field).datetime = true, (nanopb).int_size = IS_32 ];
    uint32 duration = 31
        [ (brewblox.field).unit = Second, (nanopb).int_size = IS_32 ];

    uint32 link = 40
        [ (brewblox.field).objtype = Any, (nanopb).int_size = IS_16 ];
  }
}
```

## Protobuf encoding - sequences

Every argument for any instruction can be an argument.
All arguments are grouped using protobuf `oneof` fields with two candidates:
a field containing the argument value, and a field containing a variable name.

To preserve backwards compatibility, the value field retains its previous tag.
To aid automated parsing, both fields in the `oneof` have a deterministic name:
value fields are named `__raw__{name}` and variable fields are named `__var__{name}`.

Comments are an exception, and remain unchanged.

```proto
// OLD
message WaitTemperatureRange {
  uint32 target = 1 [
    (brewblox.field).objtype = TempSensorInterface,
    (nanopb).int_size = IS_16
  ];
  sint32 lower = 2 [
    (brewblox.field).unit = Celsius,
    (brewblox.field).scale = 4096,
    (nanopb).int_size = IS_32
  ];
  sint32 upper = 3 [
    (brewblox.field).unit = Celsius,
    (brewblox.field).scale = 4096,
    (nanopb).int_size = IS_32
  ];
}

// NEW
message WaitTemperatureRange {
  oneof target {
    uint32 __raw__target = 1 [
      (brewblox.field).objtype = TempSensorInterface,
      (nanopb).int_size = IS_16
    ];
    string __var__target = 4 [ (nanopb).max_size = 16 ];
  }

  oneof lower {
    sint32 __raw__lower = 2 [
      (brewblox.field).unit = Celsius,
      (brewblox.field).scale = 4096,
      (nanopb).int_size = IS_32
    ];
    string __var__lower = 5 [ (nanopb).max_size = 16 ];
  }

  oneof upper {
    sint32 __raw__upper = 3 [
      (brewblox.field).unit = Celsius,
      (brewblox.field).scale = 4096,
      (nanopb).int_size = IS_32
    ];
    string __var__upper = 6 [ (nanopb).max_size = 16 ];
  }
}
```

## Line format encoding

To improve UX, variables in the sequence line format are held to two requirements:

- Variable arguments should use the same `key=value` syntax as value arguments.
- The syntax to indicate a variable argument should follow some common pre-existing convention.

Both are satisfied by adapting the shell scripting `$var_name` syntax.
The `$` character is disallowed in block names, enum values, and duration strings. This prevents parsing uncertainty.
As with shell variables, the `$` character is not part of the name.
A variable defined in the *Variables* block as `beer_setting` will be referenced as `$beer_setting`.

Variables can use single quotes, with the `$` character inside the quoted string.
Leading and trailing whitespace outside quotes will be automatically removed.

Example syntax:

```txt
SET_PWM target=$actuator, setting=23.46
SET_SETPOINT target='$kettle_setpoint', setting= $kettle_setting
```

## Firmware interaction

The *Variables* block is expected to prove useful outside sequence implementations.
Debugging and prototype applications can get and set values through the `VariablesBlock` class.

Any update to variables will cause the version counter to be incremented, and any consuming sequences to reload their active instruction.

When updating variables, the caller is responsible for updating the *Variables* block in persistent storage.
If the *Variables* block receives a Cbox write call after a variable was updated, but before it was persisted, all unsaved changes will be persisted.

## Future changes

The presence of variables allows for new instruction types:

- WAIT_EQUAL lhs=XXX rhs=XXX precision=XXX
- SET_VARIABLE key='var_name' value=10

Any new instructions are out of scope for the initial implementation, and no decision has been made if and when they are to be implemented.
