# Spark communication protocol

## Context

The primary controller for the Brewblox stack is the Spark.
Communication between the Spark and the Spark service is done using a serial stream, with messages being separated by control characters.
For the Spark 2/3, this is implemented using USB and Wifi. For the Spark 4, USB was deprecated, and replaced with ethernet.

For performance reasons, a custom message protocol is used.
This document describes the message protocol, and the available commands.

## Message types

Messages are sub-divided in three types:

- Commands
- Annotations
- Events

**Commands** are the primary message type. The service sends a request, and the controller responds.
Both requests and responses are terminated by newline (`\n`) characters. Responses may be sent as comma-separated chunks. More on this below.

**Annotations** are asynchronous controller-to-service messages that are not linked to a particular request.
Most annotations are for logging purposes only, and do not have a functional meaning.

Annotations are contained within `< >` characters. Annotations can interrupt commands, but not the other way around.

**Events** are annotations with a functional meaning.
Typically, they are sent as plain-text annotation to ensure backward and forward compatibility with the service.

Events are distinguished from plain annotations by using `!` as first character inside the `< >` tags.

For example, the handshake message lists the firmware version numbers, so the service may check whether it is compatible.
The currently used event messages are listed below.

## Encoding

While annotations and events are encoded as UTF-8 plaintext, commands are encoded using [Protobuf](https://github.com/google/protobuf).
The binary output from the protobuf encoding step is then encoded as base-64 to make it compatible with serial streams.

Responses can be sent as comma-separated chunks. Each chunk should be decoded from base-64 to bytes separatedly, and the output bytes should be concatenated and decoded as a single protobuf message.

Chunks from multiple messages will never be mixed, and the message will always be terminated by a newline character, regardless of whether it is sent as chunks.

## Events

Two event messages are currently in use: the controller handshake, and the firmware update handshake.

The **Controller handshake** is a comma-separated list of fields that is used to determine controller-service compatibility.
The service will prompt and read this message immediately after it connects to the controller.

Example message:

```txt
<!BREWBLOX,4558bdae,b1698b6e,2022-03-24,2022-03-15,3.2.0,gcc,00,00,123456789012345678901234>
```

The fields are:

- `BREWBLOX` - Constant string indicating this is a handshake message.
- `4558bdae` - Short git hash of the [firmware repository]([https:://](https://github.com/brewblox/brewblox-firmware)).
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

The **Firmware update handshake** is a comma-separated list of fields, sent after the controller entered OTA firmware update mode.
This mode is only available for the (physical) Spark 2 / 3.

In this mode, the controller will not respond to normal commands.

Example message:

```txt
<!FIRMWARE_UPDATER,4558bdae,b1698b6e,2022-03-24,2022-03-15,3.2.0,p1>
```

The fields are:

- `FIRMWARE_UPDATER` - Constant string indicating this is an upate handshake message.
- `4558bdae` - Short git hash of the [firmware repository]([https:://](https://github.com/brewblox/brewblox-firmware)).
- `b1698b6e` - Short git hash of the [proto message repository](https://github.com/BrewBlox/brewblox-proto).
- `2022-03-24` - Date of the active commit in the firmware repository.
- `2022-03-15` - Date of the active commit in the proto message repository.
- `3.2.0` - System layer version number. This will be different for different Spark models.
- `p1` - Controller platform. Known values are `photon`, `p1`.

## Commands

:::info
All protobuf message definitions referenced below can be found in the <https://github.com/BrewBlox/brewblox-proto> repository.
:::

All service-to-controller messages are protobuf `Request` messages,
and all controller-to-service messages are either annotations, or protobuf `Response` messages.

```protobuf
message Request {
  uint32 msgId = 1;
  Opcode opcode = 2;
  Payload payload = 3;
}

message Response {
  uint32 msgId = 1;
  ErrorCode error = 2;
  repeated Payload payload = 3;
}
```

Requests and Responses are matched by having the same `msgId` value.
The `opcode` describes the requested action, and the `error` lists the reason for failure (if any).

The `Payload` message contains the raw data of a block message, along with the metadata required to identify the block and its type.

```protobuf
message Payload {
  uint32 blockId = 1 [ (nanopb).int_size = IS_16 ];
  brewblox.BlockType blockType = 2;
  uint32 subtype = 3 [ (nanopb).int_size = IS_16 ];
  string content = 4; // Block message: proto encoded, then base64 encoded
}
```

Both the service and the controller are expected to match the `blockType` and `subtype` fields to a protobuf message definition that can be used to decode the `content` field.

As with the top-level `Request`/`Response` messages, the protobuf-encoded bytes are re-encoded as base-64 to allow for serialization.

Because `payload` is a field in both `Request` and `Response`,
block data in `payload.content` is technically encoded four times:

- The block is protobuf-encoded using its own protobuf message.
- The protobuf-encoded bytes are encoded to base-64.
- The `Request` or `Response` that includes the payload object (and its base-64 `content` field) is protobuf-encoded.
- The protobuf-encoded request/response bytes are encoded to base-64.

Not all commands require the request payload to be set or to include content. Not all commands include payload objects in their response.

## Opcodes

```protobuf
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

- Request payload: **Yes, blockId only**
- Response payload: **Yes, single block**

### BLOCK_READ_ALL

- Request payload: **No**
- Response payload: **Yes, all blocks**

### BLOCK_WRITE

- Request payload: **Yes**
- Response payload: **Yes, single block**

### BLOCK_CREATE

- Request payload: **Yes, blockId optional**
- Response payload: **Yes, single block**

### BLOCK_DELETE

- Request payload: **Yes, blockId only**
- Response payload: **No**

### BLOCK_DISCOVER

- Request payload: **No**
- Response payload: **Yes, all newly discovered blocks**

### STORAGE_READ

- Request payload: **Yes, blockId only**
- Response payload: **Yes, single block**

### STORAGE_READ_ALL

- Request payload: **No**
- Response payload: **Yes, all blocks with stored data**

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
