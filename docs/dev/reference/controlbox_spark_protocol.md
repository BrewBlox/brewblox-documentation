# Controlbox Spark serial communication protocol

## Context

The primary controller for the Brewblox stack is the Spark.
Communication between the controller and the device connector service can be done over USB, or WiFi.

The transport and object data protocol are separated.
This is done because new object types are continuously added, while the transport protocol is expected to be very static.

The transport protocol uses Controlbox logic, while the objects will be encoded using [Protobuf](https://github.com/google/protobuf).

Due to the nature of serial communication, there is no concept of "messages" at the transport layer.
The application layer is responsible for parsing messages, and matching responses to requests.

## Message delimiting

The controller can emit three kinds of messages: data, annotations, and events.

**Data** is always in response to a command, and is newline-separated.

**Annotations** are sent interleavened with data messages, to provide quick feedback on what is happening to the system. Annotations can interrupt data messages, but not the other way around.
Most annotations are for debug purposes only, and do not have a functional meaning.

Annotations are contained between `< >` characters.

Example:
```
4324235235423423423<this is an annotation>7324987324\n436823\n
```

There are two data messages, and one annotation in this example.

The log message function is defined by the application, for the Brewblox firmware, log messages are sent as annotations, prefixed with `INFO:`, `WARNING:`, `ERROR:` or `DEBUG:`.

**Events** are annotations carrying event-driven data. While data messages are only sent in response to requests, events are sent unprompted.

They distinguish themselves from annotations by using `!` as first character inside the `< >` tags.

Example:
```
12345<this is an annotation>25324<!this is an event>5345
```

On startup, the controller will send a welcome message. This message is defined by the application.

The Brewblox firmware sends a comma-separated event containing the following values:

- Application name ("BREWBLOX")
- Firmware version (git sha)
- Protocol version (git sha)
- Firmware release date (YYYY-MM-DD)
- Protocol release date (YYYY-MM-DD)
- System library version (string)
- Platform ("photon" | "p1")
- Reset reason (hex-encoded enum)
- Reset data (hex-encoded enum)
- Unique device ID

The reset reasons defined by the firmware are:

```c
    RESET_REASON_NONE = 0,
    RESET_REASON_UNKNOWN = 10, // Unspecified reason
    // Hardware
    RESET_REASON_PIN_RESET = 20, // Reset from the NRST pin
    RESET_REASON_POWER_MANAGEMENT = 30, // Low-power management reset
    RESET_REASON_POWER_DOWN = 40, // Power-down reset
    RESET_REASON_POWER_BROWNOUT = 50, // Brownout reset
    RESET_REASON_WATCHDOG = 60, // Watchdog reset
    // Software
    RESET_REASON_UPDATE = 70, // Successful firmware update
    RESET_REASON_UPDATE_ERROR = 80, // Generic update error
    RESET_REASON_UPDATE_TIMEOUT = 90, // Update timeout
    RESET_REASON_FACTORY_RESET = 100, // Factory reset requested
    RESET_REASON_SAFE_MODE = 110, // Safe mode requested
    RESET_REASON_DFU_MODE = 120, // DFU mode requested
    RESET_REASON_PANIC = 130, // System panic (additional data may contain panic code)
    RESET_REASON_USER = 140 // User-requested reset
```

The reset data values defined by the firmware are:

```c
RESET_REASON_NOT_SPECIFIED = 0,
RESET_REASON_WATCHDOG = 1,
RESET_REASON_CBOX_RESET = 2,
RESET_REASON_CBOX_FACTORY_RESET = 3,
RESET_REASON_FIRMWARE_UPDATE_FAILED = 4,
RESET_REASON_LISTENING_MODE_EXIT = 5,
RESET_REASON_FIRMWARE_UPDATE_SUCCESS = 6
```

Example: `<!BREWBLOX,7bbca3e6,695cdbf1,2020-10-11,2020-10-08,2.0.0-rc.1,p1,9=8C,06>`

## Annotation nesting

As annotations have separate start and end characters, they can be nested.

Annotations are ordered on the position of their end character.

Given the buffer:

```python
'<messageA <messageB> <messageC> > data <messageD>'
```

Yielded annotations will be:

```python
[
    'messageB',
    'messageC',
    'messageA   ',
    'messageD'
]
```

Afterwards, the buffer will contain `' data '`

## Encoding

Requests and responses use string representations of hexadecimal characters, optionally separated by whitespace.

This means that if we are sending the value `188`, we're not directly sending the byte-encoded value, but will first convert `188` to hexadecimal(`BC`), before encoding `BC` as if it were two separate characters.

This approach takes a few more bytes of data, but allows using control characters - as long as they are meaningless in hexadecimal.

In practical terms, the required steps to encode an event containing data would be:

```python
>>> from binascii import hexlify

>>> byte_array = bytearray([222, 173, 192, 222, 0, 255])
>>> print(byte_array)
bytearray(b'\xde\xad\xc0\xde\x00\xff')

>>> hex_string = hexlify(byte_array)
>>> print(hex_string)
b'deadc0de00ff'

>>> output = b'<!' + hex_string + b'>'
>>> print(output)
b'<!deadc0de00ff>'
```

We can use this to retrieve our original byte array without any confusion as to whether the exclamation mark is part of it.

## Requests

Requests are always formatted as index number + the desired action + arguments + CRC.
Each defined controller action has an opcode: a numerical identifier of the action.
For more information on how requests are formatted, and a complete list of opcodes, see the [spark commands doc](./spark_commands).

Index numbers, opcodes and arguments are treated as data, and are encoded as described in the Encoding section: first to bytes, then to hexadecimal string.

For example, we want to perform the `WRITE_OBJECT` command.

Its opcode is `2`, and it has some arguments:

* objectId: the numeric block ID.
* groups: an 8-bit mask flag denoting group membership.
* type: the type ID of the object we're writing.
* data: a byte array with the object payload (encoded using protobuf).

Let's encode:

```python
from binascii import hexlify

>>> request = b''

# Index is a 16-bit value
>>> index = 1
>>> request += hexlify(index.to_bytes(2, 'little'))

>>> opcode = 2 # 0x02
>>> request += hexlify(opcode.to_bytes(1, 'little'))

>>> print(request)
b'010002'

# Object ID is a 16-bit value
>>> object_id = 400
>>> request += hexlify(object_id.to_bytes(2, 'little'))

>>> print(request)
b'0100029001'

# Object is member of groups 1 and 3
>>> groups = 0x00 | 0b1 | 0b100
>>> request += hexlify(groups.to_bytes(1, 'little'))

>>> print(request)
b'010002900105'

>>> object_data = [255] * 10 # 0xFF * 10
>>> request += hexlify(bytes(object_data))

# We'll skip the actual CRC calculation for now
>>> crc = 0x1a
>>> request += hexlify(crc.to_bytes(1, 'little'))

>>> print(request)
b'010002900105ffffffffffffffffffff1a'

```

This hexadecimal string can now be sent to the controller, who can interpret it.

## Responses

In order to identify what request triggered the response, the controller will echo the full request (arguments and all) before sending the actual response.

The request and response are separated by a `|` character.

The first byte of the response is always the errorcode: positive means ok, negative indicates an error.

The last byte of the response is always another CRC, calculated solely using the response bytes.

Action ok, no return value (using the write value request):
```python
b'010002900105ffffffffffffffffffff1a|0000'
```

Action not ok, no further return value:
```python
b'010002900105ffffffffffffffffffff1a|81d2'
```

If the response has return values, they are encoded in the same way as the request arguments. If the error code is set (not 0), the response will only include the error code and its CRC.

## Object encoding (codecs)

As you may have noticed, we sent already encoded values for object type, and object data. This is because the controlbox protocol is not responsible for encoding and decoding objects - it just transports them.

Objects are handled by Protobuf. Each protobuf object type has a number, which is used to select the correct decoder that can convert the byte array into a Pythonic object.
