# Spark Command Syntax

## Opcodes

```python
NONE=0
READ_OBJECT=1
WRITE_OBJECT=2
CREATE_OBJECT=3
DELETE_OBJECT=4
LIST_ACTIVE_OBJECTS=5
LIST_STORED_OBJECTS=6
CLEAR_OBJECTS=7
REBOOT=8
FACTORY_RESET=9
```

## Error Codes

```python
OK=0
UNKNOWN_ERROR=1

# Object creation
INSUFFICIENT_HEAP=4

# Generic stream errors
STREAM_ERROR_UNSPECIFIED=8
OUTPUT_STREAM_WRITE_ERROR=9
INPUT_STREAM_READ_ERROR=10
INPUT_STREAM_DECODING_ERROR=11
OUTPUT_STREAM_ENCODING_ERROR=12

# Storage errors
INSUFFICIENT_PERSISTENT_STORAGE=16
PERSISTED_OBJECT_NOT_FOUND=17
INVALID_PERSISTED_BLOCK_TYPE=18
COULD_NOT_READ_PERSISTED_BLOCK_SIZE=19
PERSISTED_BLOCK_STREAM_ERROR=20
PERSISTED_STORAGE_WRITE_ERROR=21

# Invalid actions
OBJECT_NOT_WRITABLE=32
OBJECT_NOT_READABLE=33
OBJECT_NOT_CREATABLE=34
OBJECT_NOT_DELETABLE=35

# Invalid parameters
INVALID_COMMAND=63
INVALID_OBJECT_ID=65
INVALID_OBJECT_TYPE=66
INVALID_OBJECT_PROFILES=68
```

## Endianness

With the exception of `ObjectData`, all multi-byte values are little endian. </br>
`ObjectData` is considered a black box of byte values. Consequently, its endianness is irrelevant.

## Arguments

The response consists of three parts:
- Request
- Response
- Values (optional)

First argument in request is always opcode. First argument in Response is always error code.

Values are only used when they can be repeated. </br>
A command that will only ever return a single value will return it as part of the Response.

Request and response are separated by a `|` character. </br>
Response and each listed value are separated by a `,` character.

Example:
```
REQUEST | RESPONSE , VALUE , VALUE
```

Each section is validated with an 8bit Dallas OneWire CRC that is calculated for only that section.

This makes it:
```
REQUEST[CRC] | RESPONSE[CRC] , VALUE[CRC] , VALUE[CRC]
```

---
### Read Object

- Request:
    - Opcode: `uint8_t`
    - ObjectId: `uint16_t`
- Response:
    - Errorcode: `uint8_t`
    - ObjectId: `uint16_t`
    - Profiles: `bit[8]`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`

---
### Write Object

- Request:
    - Opcode: `uint8_t`
    - ObjectId: `uint16_t`
    - Profiles: `bit[8]`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`
- Response:
    - Errorcode: `uint8_t`
    - ObjectId: `uint16_t`
    - Profiles: `bit[8]`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`

---
### Create Object

- Request:
    - Opcode: `uint8_t`
    - ObjectId: `uint16_t`
    - Profiles: `bit[8]`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`
- Response:
    - Errorcode: `uint8_t`
    - ObjectId: `uint16_t`
    - Profiles: `bit[8]`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`

---
### Delete Object

- Request:
    - Opcode: `uint8_t`
    - ObjectId: `uint16_t`
- Response:
    - Errorcode: `uint8_t`

---
### List Active Objects

- Request:
    - Opcode: `uint8_t`
- Response:
    - Errorcode: `uint8_t`
- Values:
    - ObjectId: `uint16_t`
    - Profiles: `bit[8]`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`

---
### List Stored Objects

- Request:
    - Opcode: `uint8_t`
- Response:
    - Errorcode: `uint8_t`
- Values:
    - ObjectId: `uint16_t`
    - Profiles: `bit[8]`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`

---
### Clear Objects

* Request:
    * Opcode: `uint8_t`
* Response:
    * Errorcode: `uint8_t`

---
### Reboot

* Request:
    * Opcode: `uint8_t`
* Response:
    * Errorcode: `uint8_t`

---
### Factory Reset

* Request:
    * Opcode: `uint8_t`
* Response:
    * Errorcode: `uint8_t`
