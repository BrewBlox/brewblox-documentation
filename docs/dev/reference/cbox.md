# Cbox Protocol

## Context

The primary controller for the Brewblox stack is the Spark.
Communication between the Spark and the Spark service is done using a custom message-based protocol.
When using a serial stream, messages are deliminated by control characters.
For the Spark 2/3, the primary means of connection are USB and Wifi.
For the Spark 4, USB was replaced with ethernet.

For performance reasons, a custom message protocol is used: Cbox.
This document describes the Cbox message protocol, and the available commands.

## Message types

Messages are sub-divided in three types:

- Commands
- Annotations
- Events

**Commands** are the primary message type. The service sends a request, and the controller responds.
Both requests and responses are terminated by newline (`\n`) characters. Responses may be sent as comma-separated chunks. More on this below.

**Annotations** are asynchronous controller-to-service messages that are not correlated with a specific request.
Most annotations are for logging purposes only, and do not have a functional meaning.

Annotations are contained within `< >` characters. Annotations can be placed in the middle of a command. Commands, and their terminating newline, can not be placed within annotations.

**Events** are annotations with a functional meaning and a pre-defined specification.
Typically, they are encoded as plaintext to improve backward and forward compatibility with the service.

Events are distinguished from plain annotations by using `!` as first character inside the `< >` tags.

## Encoding

While annotations and events are encoded as ASCII plaintext, commands are encoded using [Protobuf](https://github.com/google/protobuf).
The binary output from the protobuf encoding step is then encoded as [base-64](https://en.wikipedia.org/wiki/Base64) to make it compatible with text-based serial streams.

Responses can be sent as comma-separated chunks. Each chunk should be decoded from base-64 to bytes separatedly, and the output bytes should be concatenated and decoded as a single protobuf message.

Chunks from multiple messages will never be mixed, and chunked messages will still be terminated by a `\n` character.

## Events

Two event messages are currently in use: the controller handshake, and the firmware update handshake.

### Controller handshake

The handshake message is a comma-separated list of fields that is used to determine controller-service compatibility.
The service will prompt and read this message immediately after it connects to the controller.

Example message:

```txt
<!BREWBLOX,4558bdae,b1698b6e,2022-03-24,2022-03-15,3.2.0,gcc,00,00,123456789012345678901234>
```

The fields are:

- `BREWBLOX` - Constant string indicating this is a handshake message.
- `4558bdae` - Short git hash of the [firmware repository](https://github.com/BrewBlox/brewblox-firmware).
- `b1698b6e` - Short git hash of the [proto message repository](https://github.com/BrewBlox/brewblox-proto).
- `2022-03-24` - Date of the active commit in the firmware repository.
- `2022-03-15` - Date of the active commit in the proto message repository.
- `3.2.0` - System layer version number. This will be different for different Spark models.
- `gcc` - Controller platform. Known values are `photon`, `p1`, `gcc`, `esp32`.
- `00` - Hexadecimal reset reason.
- `00` - Hexadecimal reset data.
- `123456789012345678901234` - device ID.

The reset reasons defined by the firmware are:

```python
NONE = '00'
UNKNOWN = '0A'
# Hardware
PIN_RESET = '14'
POWER_MANAGEMENT = '1E'
POWER_DOWN = '28'
POWER_BROWNOUT = '32'
WATCHDOG = '3C'
# Software
UPDATE = '46'
UPDATE_ERROR = '50'
UPDATE_TIMEOUT = '5A'
FACTORY_RESET = '64'
SAFE_MODE = '6E'
DFU_MODE = '78'
PANIC = '82'
USER = '8C'
```

The reset data defined by firmware are:

```python
NOT_SPECIFIED = '00'
WATCHDOG = '01'
CBOX_RESET = '02'
CBOX_FACTORY_RESET = '03'
FIRMWARE_UPDATE_FAILED = '04'
LISTENING_MODE_EXIT = '05'
FIRMWARE_UPDATE_SUCCESS = '06'
OUT_OF_MEMORY = '07'
```

### Firmware updater handshake

The updater handshake is a comma-separated list of fields, sent after the controller entered OTA firmware update mode.
This mode is only available for the `photon` and `p1` platforms.

In firmware update mode, the controller will not respond to normal commands.

Example message:

```txt
<!FIRMWARE_UPDATER,4558bdae,b1698b6e,2022-03-24,2022-03-15,3.2.0,p1>
```

The fields are:

- `FIRMWARE_UPDATER` - Constant string indicating this is an upate handshake message.
- `4558bdae` - Short git hash of the [firmware repository](https://github.com/brewblox/brewblox-firmware).
- `b1698b6e` - Short git hash of the [proto message repository](https://github.com/BrewBlox/brewblox-proto).
- `2022-03-24` - Date of the active commit in the firmware repository.
- `2022-03-15` - Date of the active commit in the proto message repository.
- `3.2.0` - System layer version number. This will be different for different Spark models.
- `p1` - Controller platform. Known values are `photon`, `p1`.

## Commands

:::tip
All protobuf message definitions referenced below can be found in the <https://github.com/BrewBlox/brewblox-proto> repository.
:::

All service-to-controller messages are protobuf `Request` messages,
and all controller-to-service messages are either annotations, or protobuf `Response` messages.

```proto
message Request {
  uint32 msgId = 1;
  Opcode opcode = 2;
  Payload payload = 3;
  ReadMode mode = 4;
}

message Response {
  uint32 msgId = 1;
  ErrorCode error = 2;
  repeated Payload payload = 3;
  ReadMode mode = 4;
}
```

Requests and Responses are matched by having the same `msgId` value.
The request `opcode` describes the requested action, and the response `error` field is >0 if the command failed for any reason. \
The `mode` field indicates what fields should be included in the response. More on this below.

The `Payload` object contains the raw data of a block protobuf message, along with the metadata required to identify the block and its type.

```proto
message Payload {
  uint32 blockId = 1;
  brewblox.BlockType blockType = 2;
  string name = 3;
  string content = 4; // Block message: proto encoded, then base64 encoded
  MaskMode maskMode = 6;
  repeated MaskField maskFields = 7;
}
```

Both the service and the controller are expected to match the `blockType` field to a protobuf message definition that can be used to decode the `content` field.

As with the top-level `Request`/`Response` messages, the protobuf-encoded bytes are re-encoded as base-64 to allow for serialization.

Because `payload` is a field in both `Request` and `Response`,
block data in `payload.content` is technically encoded four times:

- The block data is protobuf-encoded using its own protobuf message.
- The protobuf-encoded bytes are encoded to a base-64 string.
- The `Request` or `Response` that includes the payload object (and its base-64 `content` field) is protobuf-encoded.
- The protobuf-encoded request/response bytes are encoded to base-64.

Not all commands require the request payload to be set or to include content. Not all commands include payload objects in their response.

## Block IDs

Blocks have both a 32-bit numeric ID and a string name.
The numeric ID is considered the primary identifier, but the string name is required to be unique,
and can be used as secondary (human-readable) ID.

Request payloads are required to include either ID or name. If both are included, they must both refer to the same block.
Response payloads will always include block ID, but may omit block name.
There are two exceptions: responses to the `NAME_READ`, `NAME_READ_ALL`, and `NAME_WRITE` commands,
and responses where `mode` is `ReadMode.STORED`.

Block links in payload content will only include the target block ID.

## ReadMode

```proto
enum ReadMode {
  DEFAULT = 0;
  STORED = 1;
  LOGGED = 2;
}
```

Block create / read / write commands may specify the subset of fields they wish to receive in the response
by using the `ReadMode mode` field in the request. \
The mode signals the intent. It is up to the individual block to determine which fields match the mode.
Blocks are not guarantee to return the same subset of fields for each read request with the same mode.

**ReadMode.DEFAULT** includes both persistent settings and volatile data. It describes the actual state of the block.

**ReadMode.STORED** includes fields that should be persisted in storage to recreate the block with its current settings.
Typically this includes user-defined settings, but not measured values.

**ReadMode.LOGGED** includes fields that are relevant to data logging. This may include some (but not all) persistent settings.

Responses for all modes may use masks to indicate omitted fields.

## Masks

```proto
enum MaskMode {
  NO_MASK = 0;
  INCLUSIVE = 1;
  EXCLUSIVE = 2;
}

message MaskField {
  repeated uint32 address = 2
      [ (nanopb).int_size = IS_16, (nanopb).max_count = 4 ];
}

message Payload {
  ...
  MaskMode maskMode = 6;
  repeated MaskField maskFields = 7;
}
```

Both requests and responses can use masks to indicate field presence.
This feature is implemented to complement Protobuf's automatic omission of empty values,
and provides a way to distinguish between omitted fields and empty, nulled, or 0 values.

The `maskFields` field provides a list of potentially nested field tags that are included in the mask.

For the example message definition:

```proto
message MessageA {
  uint32_t value_1 = 1;
  uint32_t value_2 = 2;
}

message MessageB {
  MessageB nested_message = 3;
}
```

- A mask for `nested_message.value_1` would be `[3, 1, 0, 0]`.
- A mask for `nested_message.value_2` would be `[3, 2, 0, 0]`.
- A mask for all fields in `nested_message` would be `[3, 0, 0, 0]`.

The `maskMode` field indicates how the mask should be used.

**MaskMode.INCLUSIVE** means that only fields covered by the mask should be considered. All other fields should be excluded.

**MaskMode.EXCLUSIVE** means that only fields *not* covered by the mask should be considered. All masked fields should be excluded.

## Opcodes

```proto
enum Opcode {
  NONE = 0;
  VERSION = 1;

  BLOCK_READ = 10;
  BLOCK_READ_ALL = 11;
  BLOCK_WRITE = 12;
  BLOCK_CREATE = 13;
  BLOCK_DELETE = 14;
  BLOCK_DISCOVER = 15;

  STORAGE_READ = 20;
  STORAGE_READ_ALL = 21;

  NAME_READ = 50;
  NAME_READ_ALL = 51;
  NAME_WRITE = 52;

  REBOOT = 30;
  CLEAR_BLOCKS = 31;
  CLEAR_WIFI = 32;
  FACTORY_RESET = 33;

  FIRMWARE_UPDATE = 40;
}
```

### NONE

- Request payload: **No**
- Response payload: **No**

### VERSION

- Request payload: **No**
- Response payload: **No**
- Side effect: **The controller sends a handshake event**.

### BLOCK_READ

- Request payload: **Yes, block identity only**
- Response payload: **Yes, single block**

### BLOCK_READ_ALL

- Request payload: **No**
- Response payload: **Yes, all blocks**

### BLOCK_WRITE

- Request payload: **Yes**
- Response payload: **Yes, single block**

### BLOCK_CREATE

- Request payload: **Yes, block identity optional, block type required**
- Response payload: **Yes, single block**

### BLOCK_DELETE

- Request payload: **Yes, block identity only**
- Response payload: **No**

### BLOCK_DISCOVER

- Request payload: **No**
- Response payload: **Yes, all newly discovered blocks**

### NAME_READ

- Request payload: **Yes, block identity only**
- Response payload: **Yes, block identity without data**

### NAME_READ_ALL

- Request payload: **No**
- Response payload: **Yes, block identity for all blocks**

### NAME_WRITE

- Request payload: **Yes, block identity with current ID and desired name**
- Response payload: **Yes, block identity**

### REBOOT

- Request payload: **No**
- Response payload: **No**
- Side effect: **Controller reboots**

### CLEAR_BLOCKS

- Request payload: **No**
- Response payload: **No**
- Side effect: **All user blocks are removed**

### CLEAR_WIFI

- Request payload: **No**
- Response payload: **No**
- Side effect: **Stored Wifi credentials are cleared**

### FACTORY_RESET

- Request payload: **No**
- Response payload: **No**
- Side effect: **All user settings and blocks are cleared**

### FIRMWARE_UPDATE

- Request payload: **No**
- Response payload: **No**
- Side effect: **Serial stream switches to firmware update YMODEM protocol**
