# Cbox ReadMode

Date: 2024/05/10

## Context

The Cbox API originally had two separate "read block" opcodes: READ and READ_STORED.
READ yielded all fields, and READ_STORED only those that should be saved to storage.
The split was intended to minimize message size in storage.

With the integration of Time-Series Database (TSDB) storage, the concept of a "logged" read was introduced.
Logged read calls were implemented using field options in protobuf messages.
The service would make a regular READ call, and then exclude all non-logged fields while decoding.

The drawback to this approach is that more data is transmitted than required,
and that the firmware has no control over what fields should be logged in specific calls.

## Desired changes

The firmware should have more autonomy over when fields should be logged,
and data logging should be optimized to facilitate higher frequency TSDB insertion.

For this to happen, the firmware must be aware of when it is generating a logged message.
When possible, we also want to move to push-based block status updates.
This would allow the firmware to generate message when blocks change, and not just with a fixed interval.

## Implementation: design

Two alternatives were considered for implementation of READ_LOGGED behavior:

- Adding new Cbox opcodes for READ_LOGGED and READ_ALL_LOGGED calls.
- Adding a "ReadMode" enum field to requests, and removing the separate READ_STORED / READ_ALL_STORED opcodes.

The second option was chosen for various reasons.

Block implementations already trended to having a `read_shared(bool include_not_stored)`
function that was used by both READ and READ_STORED.
This trend was only more likely to become more pronounced with the introduction of a READ_LOGGED call.
If practical implementation already trends towards using a shared function with a flag,
we may as well take the hint and make it official.

A single read function per block proved to be less expensive in terms of binary build size.
With the limited flash memory available to us, saving 10-100 bytes per block type is a persuasive argument.

The inclusion of a mode flag to all requests means that the new behavior is automatically enabled for all
block CRUD opcodes.
The client may choose to get either stored or default responses when creating or writing blocks.
We have no immediate use case for this behavior, but it's nice to get potentially useful functionality for free.

```proto
enum ReadMode {
  DEFAULT = 0;
  STORED = 1;
  LOGGED = 2;
}

message Request {
  int32 msgId = 1;
  Opcode opcode = 2;
  Payload payload = 3;
  ReadMode mode = 4;
}
```

## Implementation: optimization

When generating logged messages, we need a mechanism to indicate what fields should be excluded.
We already have a solution for this in the form of [masking](./20240123_deep_patching.md).
The drawback is that we don't want to generate a exclusive mask for each field that is never logged.

To provide a baseline, we refactored the existing `logged` option for protobuf fields,
and added a `stored` flag to provide the same functionality to stored messages.

When decoding READ_LOGGED or READ_STORED messages, the service will exclude all fields that do not have the appropriate option.

For example, the `SetpointSensorPair` message:

```proto
message Block {
  option (brewblox.msg).objtype = SetpointSensorPair;
  option (brewblox.msg).impl = ProcessValueInterface;
  option (brewblox.msg).impl = StoredSetpointInterface;
  option (brewblox.msg).impl = SetpointSensorPairInterface;
  option (brewblox.msg).impl = EnablerInterface;
  option (brewblox.msg).impl = ClaimableInterface;

  bool enabled = 7 [ (brewblox.field).stored = true ];

  uint32 sensorId = 2 [
    (brewblox.field).objtype = TempSensorInterface,
    (brewblox.field).stored = true
  ];

  sint32 storedSetting = 8 [
    (brewblox.field).unit = Celsius,
    (brewblox.field).scale = 4096,
    (brewblox.field).stored = true,
    (brewblox.field).logged = true,
    (nanopb).int_size = IS_32
  ];

  sint32 desiredSetting = 15 [
    (brewblox.field).unit = Celsius,
    (brewblox.field).scale = 4096,
    (brewblox.field).logged = true,
    (brewblox.field).readonly = true,
    (nanopb).int_size = IS_32
  ];
  sint32 setting = 5 [
    (brewblox.field).unit = Celsius,
    (brewblox.field).scale = 4096,
    (brewblox.field).logged = true,
    (brewblox.field).readonly = true,
    (nanopb).int_size = IS_32
  ];
  sint32 value = 6 [
    (brewblox.field).unit = Celsius,
    (brewblox.field).scale = 4096,
    (brewblox.field).logged = true,
    (brewblox.field).readonly = true,
    (nanopb).int_size = IS_32
  ];
  sint32 valueUnfiltered = 11 [
    (brewblox.field).unit = Celsius,
    (brewblox.field).scale = 4096,
    (brewblox.field).logged = true,
    (brewblox.field).readonly = true,
    (nanopb).int_size = IS_32
  ];

  FilterChoice filter = 9 [ (brewblox.field).stored = true ];
  sint32 filterThreshold = 10 [
    (brewblox.field).unit = DeltaCelsius,
    (brewblox.field).scale = 4096,
    (brewblox.field).stored = true,
    (nanopb).int_size = IS_32
  ];
```

Fields may have either, both, or neither of the `stored` and `logged` options.\
Fields will never have both `stored` and `readonly` options, but not all writable options are stored.

With this approach, the firmware may still choose to exclude a logged field using a mask,
while ignoring all non-logged fields.

## Future changes

With the implementation of the `ReadMode` flag we have laid the groundwork for two desired changes:

- Replace service polls with firmware pushes for block updates.
- Only push logged data for blocks and fields that saw meaningful changes.

We have not yet scheduled these changes for implementation.
They most likely will be part of a more general move to brokered controller communication,
where both the service and the controller connect to a central eventbus.
