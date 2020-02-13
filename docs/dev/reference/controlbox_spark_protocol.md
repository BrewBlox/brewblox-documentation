# Controlbox Spark serial communication protocol

## Context

The primary controller for the Brewblox stack is the Spark.
Communication between the controller and the device connector service can be done over USB, or WiFi.

Design currently specifies a decoupled transport and object protocol. 
This because while the transport protocol is expected to remain constant, new objects will be continuously added.

The transport protocol uses Controlbox logic, while the objects will be encoded using [Protobuf][1].

Due to the nature of serial communication, requests are inherently decoupled from their response, and need to be matched.

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

The Brewblox firmware sends an event prefixed with `BREWBLOX,`, containing in order and comma separated:

- Firmware version (git sha)
- Protocol version (git sha)
- Firmware release date
- Protocol release date
- Reset reason, hex encoded
- Reset data, hex encoded (in case of a user reset triggered by our firmware on purpose)

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

Example: `<!BREWBLOX,ed70d66f0,3f2243a,2019-06-18,2019-06-18,78,00>`

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

Requests are always formatted as the desired action + arguments.
Each defined controller action has an opcode: a numerical identifier of the action.

Opcodes and arguments are treated as data, and are encoded as described in the Encoding section: first to bytes, then to hexadecimal string.

For an up-to-date list of available opcodes and their arguments, see the `brewblox-devcon-spark` or `firmware` source code.

For example, we want to perform the `WRITE_VALUE` command.

Its opcode is `2`, and it has some arguments:

* id: a list of nested IDs in range 0-127
* type: the object type we're writing
* size: the size (in bytes) that should be reserved for the object
* data: a byte array with the encoded object we want to write

Let's encode:

```python
from binascii import hexlify

>>> request = b''

>>> opcode = 2 # 0x02
>>> request += hexlify(bytes([opcode]))

>>> print(request)
b'02'

>>> id_arg = [127, 7] # 0x7F 0x07
>>> request += hexlify(bytes(id_arg))

>>> print(request)
b'027f07'

>>> type_arg = 6 # 0x06
>>> request += hexlify(bytes([type_arg]))

>>> print(request)
b'027f0706'

>>> size_arg = 10 # 0x0A
>>> request += hexlify(bytes([size_arg]))

>>> print(request)
b'027f07060a'

>>> data_arg = [255] * 10 # 0xFF * 10
>>> request += hexlify(bytes(data_arg))

>>> print(request)
b'027f07060affffffffffffffffffff'

```

This hexadecimal string can now be sent to the controller, who can interpret it.

## Responses

In order to identify what request triggered the response, the controller will echo the full request (arguments and all) before sending the actual response.

The request and response are separated by a `|` character.

The first byte of the response is always the errorcode: positive means ok, negative indicates an error.

Action ok, no return value (using the write value request):
```python
b'027f07060affffffffffffffffffff|00'
```

Action not ok, no further return value:
```python
b'027f07060affffffffffffffffffff|81'
```

If the response has return values, they are encoded in the same way as the request arguments. These return values should not be parsed if the error code is negative: they're probably not there.

## Object encoding (codecs)

As you may have noticed, we sent already encoded values for object type, and object data. This is because the controlbox protocol is not responsible for encoding and decoding objects - it just transports them.

Objects are handled by Protobuf. Each protobuf object type has a number, which is used to select the correct decoder that can convert the byte array into a Pythonic object.




[1]: https://github.com/google/protobuf


## References:

* https://github.com/google/protobuf