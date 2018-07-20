# EEPROM persistence protocol

## Context

For each object, non-volatile settings should be persisted in EEPROM memory.

EEPROM does not have a file system, and stores raw memory.
The persistence protocol is written with multiple considerations in mind:
- memory footprint per object
- containment of object corruption
- random access read/write on objects

## Objects

Each object "block" consists of the following fields:
- Opcode (Byte)
    - Created
    - Disposed
    - None
- Profile membership (Byte)
    - Each bit signifies membership of a specific profile
    - An object is deleted if it is not a member of any profile
- Block size (Byte)
    - Reserved maximum size for the object
    - Only block data is counted. Memory footprint of any object will be block size + 4 (opcode, profiles, block size, CRC).
- Block data ("block size" Bytes)
    - For the purposes of the EEPROM protocol this is an arbitrary collection of bytes.
- CRC (Byte) ???
    - Cyclic Redundancy Check value for the full object, including headers.