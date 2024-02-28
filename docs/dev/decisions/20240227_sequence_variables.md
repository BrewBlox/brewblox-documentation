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

There are five functional requirements for the implementation, and two non-functional requirements.

- Variables are identified using a human-readable key.
- Values are stored on the controller.
- Variables can be shared by multiple sequences.
- Variables can be declared or changed without changes to the consuming sequences.
- Variables can be declared, changed, or removed while the consuming sequences are active.

- Stored size is minimal
- Binary size is minimal

## Variable declaration and definition

There are four major requirements for the implementation:



- any variables store must be serialized as proto
- human-defined keys
- preferable to declare variables outside sequences
  - sequences support arbitrary instruction access
  - sequences do not support branching. the variable can only change value when editing the sequence
  - sequences do not support patching. automatic updates to variables would need to read and parse the sequence
- variables are stored in a separate block, so they can be shared by multiple sequences
- The spark 2/3 will not support variables due to binary size constraints
- The variables block is not compiled on particle platforms
- The sequence block needs a compile-time switch when resolving instruction args

## Protobuf encoding

- keys are human-defined, and dereferenced from sequence instructions -> strings stored on the controller
- protobuf uses callbacks for generic strings, and `char[]` for strings with a max size.
  - we want to avoid more separately stored strings in sequence
  - expected number of variables per block is limited (<50)
  - 16-32 max length for variable names is acceptable for both memory use and UX
  - increases to max size are backwards compatible with existing proto messages, decreases are not.
- value types are limited to those used by sequence instructions
  - digital state
  - analog value
  - temp
  - delta temp
  - timestamp (abs time)
  - duration (rel time)
  - link
- no specific or separate link types. Instructions can refer to the same block while resolving it to a different interface.

## Line format encoding

- for user-facing syntax:
  - variables should be interchangeable with value args
  - variable reference should follow a common convention
- shell scripting `$var_name` is both widely known and suitable
- the `$` character is disallowed in block names, enum values, and duration strings -> no parsing uncertainty
- in Sequence proto, we need to encode all args as union types with either a raw value, or a variable string
- the line <-> proto protocol is a generic implementation that handles all instructions equally
- we want a generic convention for the parser. User-facing proto field names are less of a consideration due to the line protocol.
- field tags must remain backwards compatible, but field names can be changed.
- if we prefix field names with deterministic values, the parser can implement a generic solution for resolving line protocol arg name to either one of the field names in the union.
- eg: the `setting` field becomes a oneof of `raw__setting` and `var__setting`.
- the parser resolves `setting=10C` to `raw__setting` and `setting=$beer_temp` to `var__setting`

## Variable dereferencing

- variables are resolved when the runner function is created at instruction start
- for long-running (wait) instructions, we want variables to resolved again on change
- we can keep local `last_changed_at` member variables in both `Variables` and `Sequence` blocks
- `last_changed_at` does not have to be stored for either
- sequence can check `last_changed_at` in update calls
- three new sequence errors are introduced
  - variables block not linked
  - unknown variable
  - invalid variable type
- args are resolved to `tl::expected` values, to account for the multiple error states
- on particle platforms, any variable args must short-circuit to error values

## Firmware interaction

- for debugging and prototype applications, it is useful to allow editing variables outside write() calls
- the `last_changed_at` member should be updated
- caller is responsible for deciding when the updated variables block should be stored
- the block is stored after write() calls. This will include any previously unsaved changes made by firmware.

## Future changes

- the presence of variables allows for new instructions and value types (wait_variable, set_variable)
- these instructions will be technically supported, but functionally useless on particle platforms
