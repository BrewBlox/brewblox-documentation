# Spark Command Syntax

## Opcodes

```python
READ_OBJECT=1
WRITE_OBJECT=2
CREATE_OBJECT=3
DELETE_OBJECT=4
READ_SYSTEM_OBJECT=5
WRITE_SYSTEM_OBJECT=6
READ_ACTIVE_PROFILES=7
WRITE_ACTIVE_PROFILES=8
LIST_ACTIVE_OBJECTS=9
LIST_SAVED_OBJECTS=10
LIST_SYSTEM_OBJECTS=11
CLEAR_PROFILE=12
FACTORY_RESET=13
RESTART=14
```

## Error Codes

```python
OK=0
UNKNOWN_ERROR=-1
STREAM_ERROR=-2
PROFILE_NOT_ACTIVE=-3
INSUFFICIENT_PERSISTENT_STORAGE=-16
INSUFFICIENT_HEAP=-17

OBJECT_NOT_WRITABLE=-32
OBJECT_NOT_READABLE=-33
OBJECT_NOT_CREATABLE=-34
OBJECT_NOT_DELETABLE=-35
OBJECT_NOT_CONTAINER=-37
CONTAINER_FULL=-38

INVALID_PARAMETER=-64
INVALID_OBJECT_ID=-65
INVALID_TYPE=-66
INVALID_SIZE=-67
INVALID_PROFILE=-68
INVALID_ID=-69
```

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

---
### Read Object

- Request:
    - Opcode: `byte`
    - ObjectId: `uint16_t`
    - ObjectType: `uint16_t`
- Response:
    - Errorcode: `byte`
    - ObjectId: `uint16_t`
    - Profiles: `bit[8]`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`

---
### Write Object

- Request:
    - Opcode: `byte`
    - ObjectId: `uint16_t`
    - Profiles: `bit[8]`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`
- Response:
    - Errorcode: `byte`
    - ObjectId: `uint16_t`
    - Profiles: `bit[8]`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`

---
### Create Object

- Request:
    - Opcode: `byte`
    - ObjectId: `uint16_t`
    - Profiles: `bit[8]`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`
- Response:
    - Errorcode: `byte`
    - ObjectId: `uint16_t`
    - Profiles: `bit[8]`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`

---
### Delete Object

- Request:
    - Opcode: `byte`
    - ObjectId: `uint16_t`
- Response:
    - Errorcode: `byte`

---
### Read System Object

- Request:
    - Opcode: `byte`
    - ObjectId: `uint16_t`
    - ObjectType: `uint16_t`
- Response:
    - Errorcode: `byte`
    - ObjectId: `uint16_t`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`

---
### Write System Object

- Request:
    - Opcode: `byte`
    - ObjectId: `uint16_t`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`
- Response:
    - Errorcode: `byte`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`

---
### Read Active Profiles

- Request:
    - Opcode: `byte`
- Response:
    - Errorcode: `byte`
    - Profiles: `bit[8]`

---
### Write Active Profiles

- Request:
    - Opcode: `byte`
    - Profiles: `bit[8]`
- Response:
    - Errorcode: `byte`
    - Profiles: `bit[8]`


---
### List Active Objects

- Request:
    - Opcode: `byte`
- Response:
    - Errorcode: `byte`
    - Profiles: `bit[8]`
- Values:
    - ObjectId: `uint16_t`
    - Profiles: `bit[8]`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`

---
### List Saved Objects

- Request:
    - Opcode: `byte`
- Response:
    - Errorcode: `byte`
    - Profiles: `bit[8]`
- Values:
    - ObjectId: `uint16_t`
    - Profiles: `bit[8]`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`

---
### List System Objects

- Request:
    - Opcode: `byte`
- Response:
    - Errorcode: `byte`
- Values:
    - ObjectId: `uint16_t`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`

---
### Clear Profile

- Request:
    - Opcode: `byte`
    - Profiles: `bit[8]`
- Response:
    - Errorcode: `byte`

---
### Factory Reset

* Request:
    * Opcode: `byte`
* Response:
    * Errorcode: `byte`

---
### Restart

* Request:
    * Opcode: `byte`
* Response:
    * Errorcode: `byte`
