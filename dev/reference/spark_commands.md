# Spark Command Protocol
This document describes the protocol for interacting with the BrewBlox Spark over TCP or serial.
This is probably not something you want to do yourself. We provide a python service that implements this protocol.

## Endianness

All multi-byte values in the protocol are sent and received little endian. </br>
The interpretation of `ObjectData` is left to each object individually. The object itself in the firmware and the codec in the service are responsible for compatibility.

## Command syntax
All data is sent and received as hex encoded uppercase ASCII strings. This allows us to use special characters outside of the [0-9A-F] range for stream handling.

A request always starts with a 1-byte opcode, followed by opcode specific arguments.

The response consists of three parts:
- Echoed request
- Response
- List values (optional)

The following special characters are used in the response:

| Special characters     | Used for                                                                                                                                         |
| :--------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------- |
| `request|response`     | Pipe character `|` separates request and response.                                                                                               |
| `,listvalue,listvalue` | A comma is sent before each list value. It also indicates the end of the previous list value/response.                                           |
| `\n`                   | Commands and responses end with `\n`. Unused chars after processing the command are spooled until `\n` is found.                                 |
| `<comment>`            | Anything between angled brackets is a comment. It can be ignored in parsing.                                                                     |
| `<!event>`             | A comment starting with `!` is an event that requires special handling by the service. An example is an error raised while handling the request. |


A response always starts with a 1-byte error code.<br>
A command that will only ever return a single value will return it as part of the Response.<br>
List values are only used in the LIST_ACTIVE_OBJECTS and LIST_STORED_OBJECTS commands.<br>

Examples (spaces only for readability):
```
REQUEST | RESPONSE
REQUEST | RESPONSE, LIST_VALUE, LIST_VALUE
REQUEST | RESP<!event>ONSE, LIST_VALUE, LIST_VALUE
```

Each section is validated with an 8bit Dallas OneWire CRC that is calculated for only that section.
Any comments/events interrupting the data are not part of the CRC.

This makes it:
```
REQUEST[CRC] | RESPONSE[CRC] , VALUE[CRC] , VALUE[CRC]
```

---

## Objects
The protocol is designed to manage objects on an embedded controller. The objects can be created, read, written and deleted.

Each object type can freely choose how to implement encoding and decoding the `ObjectData` stream it receives and sends. In BrewBlox we use mostly Google Protocol Buffers (protobuf).

Each object has a unique `ObjectId` and a `ObjectType`. It also has a bit field `profiles`.

## Profiles
There are 8 profiles. Which profiles are active is determined by the global `Active Profiles` setting. Each object can be part of multiple profiles. The `profiles` bit field encodes this.
An object will be active if a binary AND of its `profiles` bit field and the global `Active Profiles` setting is non-zero.

### Special Objects
There are 2 special objects that are part of the protocol to manage profiles and inactive objects.

#### Inactive Object
If an object is currently not active, it reads as a different type, namely InactiveObject: ObjectType 1.
The object data is a single `uint16_t` containing the actual object type, streamed little endian.

#### Active Profiles Object
The active profiles setting is written and read as any other object. This special object has a single `uint8_t` bit field as object data. Any write to this object will change the active profiles setting.
Writing to this object will also activate or de-activate all other objects that are affected by the new active profiles setting.
An object that is re-activated will load its stored settings from persisted storage.

#### Considerations
The following design decisions affected the protocol:

* Inactive objects are still listed so the client knows they exist. Keeping them in the runtime active container as inactive objects allows us to know which objects exist in persistent storage without having to read it often (which can be slow). It also allows us to tell the client that they exist and what type they are.
* Implementing the active profiles setting as a system object has a few benefits: 
    * We don't need a special command to change the active profiles.
    * We don't need to handle persisting the setting separately.
    * It is streamed out with all the other objects, so the client gets all information with one command.

## System objects
The application can supply static system objects for reading and writing settings. These objects are readable, writable and optionally persisted depending on their implementation. They cannot be deleted or deactivated. Writing their `profiles` bit field has no effect.

Any object with an ID below 100 is considered a system object. The user cannot create objects with an ID below 100.

Examples of possible system objects are:
* Device name
* WiFi settings
* System time
* System version
* Active profiles
* OneWire bus
* Global settings like preferred display units (Celsius/Fahrenheit)


## Commands
Below is an overview of all commands in the protocol. Each command is triggered by sending an opcode as the first byte.

All commands send an error code as first byte of the response. 

### Opcodes

```python
NONE = 0,                # no-op
READ_OBJECT = 1,         # stream an object to the data out
WRITE_OBJECT = 2,        # stream new data into an object from the data in
CREATE_OBJECT = 3,       # add a new object
DELETE_OBJECT = 4,       # delete an object by id
LIST_OBJECTS = 5,        # list all objects
READ_STORED_OBJECT = 6,  # read persistent settings of an object directly from storage
LIST_STORED_OBJECTS = 7, # read persistent settings of all objects directly from storage
CLEAR_OBJECTS = 8,       # remove all user objects
REBOOT = 9,              # reboot the system
FACTORY_RESET = 10,      # erase all settings and reboot
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
INVALID_OBJECT_PROFILES = 66,
CRC_ERROR_IN_COMMAND = 67,
```


### Read Object
Reads a single object.
If the object cannot be found, INVALID_OBJECT_ID is returned as error code.

- Request:
    - Opcode: `uint8_t = 1`
    - ObjectId: `uint16_t`
- Response:
    - Errorcode: `uint8_t`
    - ObjectId: `uint16_t`
    - Profiles: `bit[8]`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`

---
### Write Object
Writes a single object. Note that not every value inside an object needs to be writable.
The object itself is in charge which received data it ignores.
The ObjectData in the request can be different from the ObjectData in the response.
The response is identical to what a read would return.

If the object cannot be found, `INVALID_OBJECT_ID` is returned as error code.<br>
If the object type does not match, `INVALID_OBJECT_TYPE` is returned as error code.<br>
If the object is not writable, `OBJECT_NOT_WRITABLE` is returned as error code.<br>

Objects can return other status codes while parsing the data.
If the object specific stream parser returns a non-zero error code, the write is not persisted to storage.

If the new profiles bit field results in de-activating the object, the response will contain InactiveObject. The response matches what a read would return.

Writing to an inactive object will temporarily create an object to parse the data, but it will be deactivated again before the command returns. The data is persisted.

- Request:
    - Opcode: `uint8_t = 2`
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
Creates a single object. The application implements an object factory that creates a runtime object based on the object type received.

If ObjectId is zero in the request, the Spark assigns an id and returns it in the response.
If the requested ID is in the system object id range, `INVALID_OBJECT_ID` is returned.

Matches write in other behavior.

- Request:
    - Opcode: `uint8_t = 3`
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
Removes a single object.
If the requested ID is in the system object id range, `OBJECT_NOT_DELETABLE` is returned.
If the object is not found, `INVALID_OBJECT_ID` is returned.

This command also erases the object from persisted storage. If the object was not found but did exist in storage, it is still removed from storage. This situation can only occur if the stored object is invalid.


- Request:
    - Opcode: `uint8_t = 4`
    - ObjectId: `uint16_t`
- Response:
    - Errorcode: `uint8_t`

---
### List Active Objects
Lists all objects as a comma separated list. Each individual object matches what read would return.

- Request:
    - Opcode: `uint8_t = 5`
- Response:
    - Errorcode: `uint8_t`
- List Values:
    - ObjectId: `uint16_t`
    - Profiles: `bit[8]`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`

---
### Read Stored Object
Reads the persisted data of a single object, directly from storage.
Bypasses any runtime objects.

This command can be used to read the stored data for an inactive object.

This command can also be used to read persisted data for an object that failed to load, because:
- The object type does not exist in the object factory (never existed or new version)
- Parsing the persisted data failed or had a CRC error

Allowing the service to read the persisted data enables it to handle these situations:
- Use outdated version data to replace the object with the updated object type
- Ask the user to check the data that failed to parse and correct it

The persisted data in storage is followed by a CRC. This allows us to distinguish between erroneous storage data or a communication error. This CRC is calculated over ObjectId, Profiles, ObjectType and ObjectData.

So the entire response looks like:

```
[request CRC] | [Errorcode [ObjectId, ObjectType, ObjectData, CRC] CRC]
```
`[` and `]` are not actually sent. They indicate what's parts of each CRC.

- Request:
    - Opcode: `uint8_t = 6`
- Response:
    - Errorcode: `uint8_t`
    - ObjectId: `uint16_t`
    - Profiles: `bit[8]`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`
  
---
### List Stored Objects
Similar read stored object, but streams out all objects in storage. Each list value has a storage CRC and a communication CRC.
```
[request CRC] | [Errorcode CRC],[[ObjectId, ObjectType, ObjectData, CRC] CRC],[[ObjectId, ObjectType, ObjectData, CRC] CRC]
```
`[` and `]` are not actually sent. They indicate what's parts of each CRC.

- Request:
    - Opcode: `uint8_t = 7`
- Response:
    - Errorcode: `uint8_t`
- Values:
    - ObjectId: `uint16_t`
    - Profiles: `bit[8]`
    - ObjectType: `uint16_t`
    - ObjectData: `byte[]`

---
### Clear Objects
Deleted all user objects. System objects are unaffected and keep their value.
To also reset system objects, use Factory Rest.

- Request:
    - Opcode: `uint8_t = 8`
- Response:
    - Errorcode: `uint8_t`

---
### Reboot
Triggers are reboot.

- Request:
    - Opcode: `uint8_t = 9`
- Response:
    - Errorcode: `uint8_t`

---
### Factory Reset
Wipes all persisted data and reboots.

- Request:
    - Opcode: `uint8_t = 10`
- Response:
    - Errorcode: `uint8_t`
