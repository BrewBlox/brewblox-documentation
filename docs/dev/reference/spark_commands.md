# Spark Command Protocol

This document describes the protocol for interacting with the BrewBlox Spark over TCP or serial.

## Endianness

All multi-byte values in the protocol are sent and received little endian. </br>
The interpretation of `ObjectData` is left to each object individually. The object itself in the firmware and the codec in the service are responsible for compatibility.

## Command syntax

All data is sent and received as hex encoded uppercase ASCII strings. This allows us to use special characters outside of the [0-9A-F] range for stream handling.

A request always starts with a 2-byte message id, then a 1-byte opcode, followed by opcode specific arguments.

The response consists of three parts:

- Echoed request
- Response
- List values (optional)

Commands also use non-hexadecimal characters as punctuation.

| Syntax                 | Used for                                                                                                                                         |
| :--------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| `request|response`     | Pipe character `|` separates request and response.                                                                                               |
| `,listvalue,listvalue` | A comma is sent before each list value. It also indicates the end of the previous list value/response.                                           |
| `\n`                   | Commands and responses end with `\n`. Unused chars after processing the command are spooled until `\n` is found.                                 |
| `<comment>`            | Anything between angled brackets is a comment. It can be ignored in parsing.                                                                     |
| `<!event>`             | A comment starting with `!` is an event that requires special handling by the service. An example is an error raised while handling the request. |

A response always starts with a 1-byte error code.<br>
A command that will only ever return a single value will return it as part of the Response.<br>
List values are only used in the LIST_ACTIVE_OBJECTS and LIST_STORED_OBJECTS commands.<br>

Examples (spaces added for readability):

```
REQUEST | RESPONSE
REQUEST | RESPONSE, LIST_VALUE, LIST_VALUE
REQUEST | RESP<!event>ONSE, LIST_VALUE, LIST_VALUE
```

Each section is validated with an 8bit Dallas OneWire CRC that is calculated for only that section.
Any comments/events interrupting the data are not used to calculate the CRC.

This makes it:

```
REQUEST[CRC] | RESPONSE[CRC] , VALUE[CRC] , VALUE[CRC]
```

---

## Commands

Below is an overview of all commands in the protocol. Each command is identified by its first (opcode) byte.

All commands send an error code as first byte of the response.

### Opcodes

```python
NONE = 0,
READ_OBJECT = 1,
WRITE_OBJECT = 2,
CREATE_OBJECT = 3,
DELETE_OBJECT = 4,
LIST_OBJECTS = 5,
READ_STORED_OBJECT = 6,
LIST_STORED_OBJECTS = 7,
CLEAR_OBJECTS = 8,
REBOOT = 9,
FACTORY_RESET = 10,
LIST_COMPATIBLE_OBJECTS = 11,
DISCOVER_OBJECTS = 12,
```

### Error Codes

```python
OK = 0,
UNKNOWN_ERROR = 1,

# object creation
INSUFFICIENT_HEAP = 4,

# generic stream errors
STREAM_ERROR_UNSPECIFIED = 8,
OUTPUT_STREAM_WRITE_ERROR = 9,
INPUT_STREAM_READ_ERROR = 10,
INPUT_STREAM_DECODING_ERROR = 11,
OUTPUT_STREAM_ENCODING_ERROR = 12,

# storage errors
INSUFFICIENT_PERSISTENT_STORAGE = 16,
PERSISTED_OBJECT_NOT_FOUND = 17,
INVALID_PERSISTED_BLOCK_TYPE = 18,
COULD_NOT_READ_PERSISTED_BLOCK_SIZE = 19,
PERSISTED_BLOCK_STREAM_ERROR = 20,
PERSISTED_STORAGE_WRITE_ERROR = 21,
CRC_ERROR_IN_STORED_OBJECT = 22,

# invalid actions
OBJECT_NOT_WRITABLE = 32,
OBJECT_NOT_READABLE = 33,
OBJECT_NOT_CREATABLE = 34,
OBJECT_NOT_DELETABLE = 35,

# invalid parameters
INVALID_COMMAND = 63,
INVALID_OBJECT_ID = 64,
INVALID_OBJECT_TYPE = 65,
INVALID_OBJECT_GROUPS = 66,
CRC_ERROR_IN_COMMAND = 67,
OBJECT_DATA_NOT_ACCEPTED = 68,

# freak events that should not be possible
WRITE_TO_INACTIVE_OBJECT = 200,

```

### Read Object

Reads a single object.

- Request:
  - MsgId: `uint16_t`
  - Opcode: `uint8_t = 1`
  - ObjectId: `uint16_t`
- Response:
  - Errorcode: `uint8_t`
  - ObjectId: `uint16_t`
  - Groups: `bit[8]`
  - ObjectType: `uint16_t`
  - ObjectData: `byte[]`

---

### Write Object

Writes a single object.
The response is identical to what a read would return.
If the new groups bit field results in de-activating the object, the response will contain an InactiveObject.
Data written to an InactiveObject will be persisted.

- Request:
  - MsgId: `uint16_t`
  - Opcode: `uint8_t = 2`
  - ObjectId: `uint16_t`
  - Groups: `bit[8]`
  - ObjectType: `uint16_t`
  - ObjectData: `byte[]`
- Response:
  - Errorcode: `uint8_t`
  - ObjectId: `uint16_t`
  - Groups: `bit[8]`
  - ObjectType: `uint16_t`
  - ObjectData: `byte[]`

---

### Create Object

Creates a single object.

If `ObjectId` is zero in the request, the Spark assigns an id and returns it in the response.
`ObjectId` must not fall in the system object ID range.

Matches write in other behavior.

- Request:
  - MsgId: `uint16_t`
  - Opcode: `uint8_t = 3`
  - ObjectId: `uint16_t`
  - Groups: `bit[8]`
  - ObjectType: `uint16_t`
  - ObjectData: `byte[]`
- Response:
  - Errorcode: `uint8_t`
  - ObjectId: `uint16_t`
  - Groups: `bit[8]`
  - ObjectType: `uint16_t`
  - ObjectData: `byte[]`

---

### Delete Object

Removes a single object.

- Request:
  - MsgId: `uint16_t`
  - Opcode: `uint8_t = 4`
  - ObjectId: `uint16_t`
- Response:
  - Errorcode: `uint8_t`

---

### List Active Objects

Lists all objects as a comma separated list. Each individual object matches what read would return.

- Request:
  - MsgId: `uint16_t`
  - Opcode: `uint8_t = 5`
- Response:
  - Errorcode: `uint8_t`
- List Values:
  - ObjectId: `uint16_t`
  - Groups: `bit[8]`
  - ObjectType: `uint16_t`
  - ObjectData: `byte[]`

---

### Read Stored Object

Reads the persisted data of a single object, directly from storage.
Bypasses any runtime objects.

This command can be used to read the stored data for an inactive object.

- Request:
  - MsgId: `uint16_t`
  - Opcode: `uint8_t = 6`
  - ObjectId: `uint16_t`
- Response:

  - Errorcode: `uint8_t`
  - ObjectId: `uint16_t`
  - Groups: `bit[8]`
  - ObjectType: `uint16_t`
  - ObjectData: `byte[]`

---

### List Stored Objects

Similar to Read Stored Object, but returns all objects in storage.

- Request:
  - MsgId: `uint16_t`
  - Opcode: `uint8_t = 7`
- Response:
  - Errorcode: `uint8_t`
- Values:
  - ObjectId: `uint16_t`
  - Groups: `bit[8]`
  - ObjectType: `uint16_t`
  - ObjectData: `byte[]`

---

### Clear Objects

Deleted all user objects. System objects are unaffected and keep their value.
To also reset system objects, use Factory Reset.

- Request:
  - MsgId: `uint16_t`
  - Opcode: `uint8_t = 8`
- Response:
  - Errorcode: `uint8_t`

---

### Reboot

Triggers a controller reboot after returning the response.

- Request:
  - MsgId: `uint16_t`
  - Opcode: `uint8_t = 9`
- Response:
  - Errorcode: `uint8_t`

---

### Management

After returning the response, the controller enters the specified subroutine, and then reboots.

```
FACTORY_RESET = 1,
FIRMWARE_UPDATE = 2,
```

- Request:
  - MsgId: `uint16_t`
  - Opcode: `uint8_t = 10`
  - Command: `uint_8_t`
- Response:
  - Errorcode: `uint8_t`

---

### List Compatible Objects

Returns IDs of all objects on the controller that implement or inherit the provided type.

- Request:
  - MsgId: `uint16_t`
  - Opcode: `uint8_t = 11`
  - ObjectType: `uint16_t`
- Response:
  - Errorcode: `uint8_t`
- Values:
  - ObjectId: `uint16_t`

---

### Discover Objects

Creates new objects for all connected hardware that is not yet referred to by any other objects.
Returns object IDs for newly created objects.

The newly created object will be of the default type for the connected sensor or actuator.

- Request:
  - MsgId: `uint16_t`
  - Opcode: `uint8_t = 12`
  - ObjectType: `uint16_t`
- Response:
  - Errorcode: `uint8_t`
- Values:
  - ObjectId: `uint16_t`
