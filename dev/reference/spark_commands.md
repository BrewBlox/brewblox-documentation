# Spark Command Syntax

## Opcodes

```python
READ_VALUE=1,  # read a value
WRITE_VALUE=2,  # write a value
CREATE_OBJECT=3,  # add object in a container
DELETE_OBJECT=4,  # delete the object at the specified location
LIST_OBJECTS=5,  # list objects in a container
FREE_SLOT=6,  # retrieves the next free slot in a container
CREATE_PROFILE=7,  # create a new profile
DELETE_PROFILE=8,  # delete a profile
ACTIVATE_PROFILE=9,  # activate a profile
LOG_VALUES=10,  # log values from the selected container
RESET=11,  # reset the device
FREE_SLOT_ROOT=12,  # find the next free slot in the root container
UNUSED=13,  # unused
LIST_PROFILES=14,  # list the define profile IDs and the active profile
READ_SYSTEM_VALUE=15,  # read the value of a system object
WRITE_SYSTEM_VALUE=16,  # write the value of a system object
```

## Error Codes

```python
OK=0,
UNKNOWN_ERROR=-1,
STREAM_ERROR=-2,
PROFILE_NOT_ACTIVE=-3,
INSUFFICIENT_PERSISTENT_STORAGE=-16,
INSUFFICIENT_HEAP=-17,

OBJECT_NOT_WRITABLE=-32,
OBJECT_NOT_READABLE=-33,
OBJECT_NOT_CREATABLE=-34,
OBJECT_NOT_DELETABLE=-35,
OBJECT_NOT_CONTAINER=-37,
CONTAINER_FULL=-38,

INVALID_PARAMETER=-64,
INVALID_OBJECT_ID=-65,
INVALID_TYPE=-66,
INVALID_SIZE=-67,
INVALID_PROFILE=-68,
INVALID_ID=-69
```

## Arguments

First argument in request is always opcode. First argument in Response is always error code

---
### Read Value

* Opcode: 1
* Request:
    * Opcode: Byte
    * ObjectId: Variable Length Id
    * ObjectType: Byte
    * ObjectSize: Byte
* Response:
    * ErrorCode: Byte
    * ObjectType: Byte
    * ObjectSize: Byte
    * ObjectData: Byte[]

**TODO**:
* Remove size from request
* Remove size from response

---
### Write Value

* Opcode: 2
* Request:
    * Opcode: Byte
    * ObjectId: Variable Length Id
    * ObjectType: Byte
    * ObjectSize: Byte
    * ObjectData: Byte[]
* Response:
    * ErrorCode: Byte
    * ObjectType: Byte
    * ObjectSize: Byte
    * ObjectData: Byte[]

**TODO**:
* Remove size from request
* Remove size from response

---
### Create Object

* Opcode: 3
* Request:
    * Opcode: Byte
    * ObjectType: Byte
    * ObjectSize: Byte
    * ObjectData: Byte[]
* Response:
    * ErrorCode: Byte

**TODO**:
* Add ObjectId to response
* Remove ObjectSize from request

---
### Delete Object

* Opcode: 4
* Request:
    * Opcode: Byte
    * ObjectId: Variable Length Id
* Response:
    * ErrorCode: Byte

---
### List Objects

* Opcode: 5
* Request:
    * Opcode: Byte
    * ProfileId: int8_t
* Response:
    * ErrorCode: Byte
    * Padding: Byte
    * Objects (repeated):
        * ObjectId: Variable Length Id
        * ObjectType: Byte
        * ObjectSize: Byte
        * ObjectData: Byte[]
    * Padding: Byte
    * Terminated: Null Byte

**TODO**:
* Remove padding from response
* Remove ObjectSize from response

---
### Free Object Slot

* Opcode: 6
* Request:
    * Opcode: Byte
    * ObjectId: Variable Length Id
* Response:
    * ErrorCode: Byte

---
### Create Profile

* Opcode: 7
* Request:
    * Opcode: Byte
* Response:
    * ErrorCode: Byte
    * ProfileId: int8_t

---
### Delete Profile

* Opcode: 8
* Request:
    * Opcode: Byte
    * ProfileId: int8_t
* Response:
    * ErrorCode: Byte

---
### Activate Profile

* Opcode: 9
* Request:
    * Opcode: Byte
    * ProfileId: int8_t
* Response:
    * ErrorCode: Byte

---
### Log Values

* Opcode: 10
* Request:
    * Opcode: Byte
    * Flags: Byte with bit flags
        * bit 1: Id chain
        * bit 2: Log system container
    * Optional: ObjectId: Variable Length Id
* Response:
    * ErrorCode: Byte
    * Optional: Objects (repeated):
        * ObjectId: Variable Length Id
        * ObjectType: Byte
        * ObjectSize: Byte
        * ObjectData: Byte[]
    * Padding: Byte
    * Terminated: Null Byte

**TODO**:
* Remove padding from response
* Remove ObjectSize from response

---
### Reset

* Opcode: 11
* Request:
    * Opcode: Byte
    * Flags: Byte with bit flags
        * bit 1: erase EEProm
        * bit 2: hard reset
* Response:
    * ErrorCode: Byte

---
### Free Root Slot

* Opcode: 12
* Request:
    * Opcode: Byte
    * System Object Id: Variable Length Id
* Response:
    * ErrorCode: Byte

---
### List Profiles

* Opcode: 14
* Request:
    * Opcode: Byte
* Response:
    * ErrorCode: Byte
    * ProfileId: int8_t
    * Profiles (repeated):
        * ProfileId: int8_t

---
### Read System Value

* Opcode: 15
* Request:
    * Opcode: Byte
    * SystemObjectId: Variable Length Id
    * ObjectType: Byte
    * ObjectSize: Byte
* Response:
    * ErrorCode: Byte
    * ObjectType: Byte
    * ObjectSize: Byte
    * ObjectData: Byte[]

**TODO**:
* Remove size from request
* Remove size from response

---
### Write System Value

* Opcode: 16
* Request:
    * Opcode: Byte
    * SystemObjectId: Variable Length Id
    * ObjectType: Byte
    * ObjectSize: Byte
    * ObjectData: Byte[]
* Response:
    * ErrorCode: Byte
    * ObjectType: Byte
    * ObjectSize: Byte
    * ObjectData: Byte[]

**TODO**:
* Remove size from request
* Remove size from response
