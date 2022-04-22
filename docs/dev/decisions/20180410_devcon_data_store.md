# Spark device connector data store selection

Date: 2018/04/10

## Context

It's desirable for some data to be persisted to file.
Currently known values include:

* A user-defined ID alias (`environment_sensor_1` is equivalent to `[1, 5, 42]`).
* A user-defined display name (`environment_sensor_1` is displayed as `"backyard shed sensor"`)

As the data is closely coupled with specific controllers (ID alias matches to hardware ID), this data store should be run inside the device connector service.

## Requirements

Must:

* Persistent key/value mapping
* Single item write/read
* Must be compatible with ARMv7 and AMD architecture
* Does not require additional processes
* Compatible with asyncio
* Actively maintained
* Small footprint
* Free

Should:

* Supports simple data migration
* Plug-n-play Python (de)serialization library
* Open source

Don't care:

* Multi-process support
* Access control (authentication / authorization)

## Options

### [PickleDB][1]

Lacks asyncio bindings.

### SQLite

SQLite + ORM asyncio library not found.

### Couchbase Lite

Does not have Python bindings (<https://github.com/couchbase/couchbase-lite-core/issues/91>)

### Redis, PostgreSQL, MySQL, CouchDB

Large, add unneccessary features, and require external processes.

### MongoDB, Codernity, Buzhug

Requires an external process.

### [TinyDB][3] (with [asyncio wrapper][4])

TinyDB seems well supported, but the wrapper is fan-made.
It's also optimized around size, not speed.

Using its recommended optimization features (different json library, and a caching middleware), its performance seems acceptable.
If speed is not taken into account, then its use of JSON files is a plus. It makes data migration and transfer a lot easier.

### ZODB

Really nice syntax.
Does not support asyncio. A GitHub issue recommends thread workers
<https://github.com/zopefoundation/ZODB/issues/53>

## Conclusion

The simplest and most straightforward implementation that matches requirements is TinyDB.
Its drawbacks are performance, and that the asyncio wrapper library does not have a large backing community or company.

We'll have to migrate to a database running in an external container if performance becomes an issue.

`aiotinydb` is sufficiently small that in the worst case scenario (stops being maintained, no replacement available), we can maintain it ourselves.

As TinyDB also offers in-memory storage, we can reuse the same database access layer for the object cache.

An added bonus is that TinyDB serializes to plain JSON. This makes its backing files user-readable, and allows easy data migration.

[1]: https://pythonhosted.org/pickleDB/
[3]: https://tinydb.readthedocs.io/en/latest/#
[4]: https://github.com/ASMfreaK/aiotinydb
