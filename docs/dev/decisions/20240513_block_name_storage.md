# Block Names on Controller

Date: 2024/05/13

## Context

Since the first implementation, blocks have had two separate identifiers: a numeric ID, and a human-readable string name.
Due to space constraints on the controller, an ID<->name lookup table was stored in the service database.

This separation of storage unsurprisingly came with its own drawbacks.
Both the controller blocks and the name table could be removed or edited independently, leading to mismatches.\
If the name table was removed, it would be regenerated with default names,
leading to the service reporting a full complement of "New|{blockType}-{number}" blocks.\
If the blocks were removed, it would lead to orphaned entries in the name table.
This could cause false positives (a new block is created with the same ID gets reported under the old name)
and errors (a block can't be created because the name is already in use).

The Spark 4 has ample storage space for both block data and names, but the limiting factor remained the Spark 2 and 3,
with their effective 2KB persistent storage.
Because the infrastructure for name resolution was done at service level, a separate implementation would only increase complexity.

Napkin estimates set an acceptable limit to block name length at 64 characters,
and the expected maximum number of blocks at around 100. Any more, and RAM is likely to be the limiting factor.
With this, we'd need 6.4KB additional storage to add a name to each block.

Re-evaluation of the Particle system libraries offered a solution. The 2KB storage is based on emulated EEPROM using NAND flash storage.
The EEPROM emulation class uses pagination plus 300% overhead to allow for random access storage of each byte within the 2KB address space.
Every "stored" byte is tracked using a record that has two address bytes and a CRC byte.
Due to the limitations of NAND flash, and the need for wear leveling, records are not edited in-place, but replaced with an appended record.
Records are appended within the page until the end is reached, followed by a page swap to write all active records to the alternative page.

The underlying flash memory consists of two regions: one 16KB and one 64KB.
Each region can only be erased in its entirety. Paginated implementations still have a max storage capacity of 16KB.
Our use case has no need for per-byte addressing, and allowed for a roughly comparable storage implementation with significantly less overhead.
Due to implementation details, storage efficiency can't be compared directly, but at a conservative estimate we gained 10KB effective storage.

10KB is more than the estimated required 6.4KB, so storing block names on the controller became a possibility.

## Limitations

A block has (on average) two links to other blocks. The additional 10KB storage budget does not allow for 3*6.4KB=19.2KB extra data.
We can afford to store the block name on the controller. We cannot afford to have the block name replace the numeric ID as the primary identifier.

For the same reasons, we also don't want to serialize the block name for each link in Protobuf messages.
The service will have to retain an ID<->name lookup table to resolve link IDs.
This is not a problem, as the controller can provide the lookup table in its entirety, and is now the source of truth for both block data and names.

## Implementation

The block name will be kept in two places: once in the runtime representation of the block, and once in the serialized data record used to store the block.

The object container class is already responsible for tracking block IDs, and will return an error when trying to insert a new block with a duplicate ID.
This will be extended to also verify that the proposed block name is unique.

The original 16-bit range for block IDs meant that removing and recreating ranges of blocks on the controller
could lead to false matches in external name lookup tables.
We can use our newfound increased storage budget to switch to 32-bit block IDs, and randomly generate IDs for new blocks.
We still guarantee the new ID to be unique, but this makes ID collisions within old name lookup tables very unlikely.

As we can't afford the costs of replacing the block ID with the block name as the primary identifier,
we already introduced the requirement for the service to keep an ID<->name lookup table.
We can reduce serialized message size by making use of this pre-existing requirement.
Responses using `ReadMode.DEFAULT` or `ReadMode.STORED` will always include the block name, but those with `ReadMode.LOGGED` will not.

To allow for explicit name management, we introduced three new Cbox opcodes: `NAME_READ`, `NAME_READ_ALL`, and `NAME_WRITE`.\
`NAME_READ` and `NAME_READ_ALL` will return block ID, name, and type without block data.\
`NAME_WRITE` lets clients rename blocks.

When creating blocks, a valid and unique name must be provided.
When blocks are discovered, we don't have a user-defined name at hand. Here, we must generate a unique human-readable name.
For user convenience, we first try `Block {hexed block ID}`. Known discovered types like temperature sensors replace the generic "Block" with a custom prefix.

The names for system blocks are hardcoded in firmware. On balance, we decided we'd rather explicitly disallow changing their name.

## Data migration

When first updating to the firmware that includes these changes, the block data will be incomplete, as names are missing.
The migration can be handled by first generating default names for blocks on the controller, and then relying on the service to apply the old name table.
When synchronizing with a controller, the service can query the database for a name table.
If found, it attempts to rename the blocks on the controller before deleting the table in the database.

The change to random uint32_t IDs will minimize the number of false positives if an old name table is found in a database long after the controller was first updated.
Any new blocks will have IDs that are very unlikely to occur in the old name table, and the (undesired) attempt to synchronize the names will fail silently.
