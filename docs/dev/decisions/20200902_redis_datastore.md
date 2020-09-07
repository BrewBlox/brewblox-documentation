# Redis datastore

Date: 2020/09/02

## Context

Brewblox systems use three kinds of persistent data:
- Service-specific configuration files
- Time series history data
- Persistent configuration data

The first category includes `.env`, `docker-compose.yml`, SSL certificates in the `traefik` directory,
and emulated EEPROM for Spark simulator services.
For these files, the file format and name are important, and the data cannot be placed in a database.

Measurement results are placed in a Time Series Database (TSDB).
TSDB's are optimized to store and access large quantities of flat values indexed by a timestamp.
We use [InfluxDB](https://www.influxdata.com/) for this.

All other persistent data is stored in a separate database.
We currently use [Apache CouchDB](https://couchdb.apache.org/),
but are increasingly unhappy about it.
This document describes the problems with CouchDB, and the requirements, candidates, and implementation for its replacement.

## CouchDB problems

CouchDB has clearly defined requirements, and does a great job fulfilling them.
We are looking for a replacement because it has become apparent that these requirements do not align well with ours.

CouchDB is well-suited for scenarios where multiple master nodes share changes over an unreliable connection.
We experimented with this design, but found that we don't particularly care about the appearance of functionality if connection to the backend could not be established.

The revision-based approach, where updates were required to include the latest revision ID,
caused more problems than it prevented data corruption.
We do not use partial updates of configuration objects.
This makes all individual updates valid, regardless of order.
If two users attempt simultaneous writes to the same object,
then the software should show the update "winner" with the minimum amount of fuss.
In terms of user obstruction, `Document Update Conflict` errors are a cure worse than the ailment.

Exporting and importing the full database state is remarkably clunky.
Revision IDs have to be stripped from the dataset during the process,
and the format is not symmetrical.

When setting up a lone CouchDB node, the `_users`, `_replicator`, and `_global_changes` databases have to be explicitly set up.
For us, this is irrelevant overhead.

CouchDB is slow to start. On a Raspberry Pi platform, it takes about a minute for its API to be available.

There is an unresolved problem with CouchDB, where data may become corrupted.
This is often resolved after CouchDB has crashed once or twice,
but it is annoyingly common, and only adds to the long startup time.

The official Docker CouchDB image is not available for ARM32.
We use a [third-party image](https://hub.docker.com/r/treehouses/couchdb/) that happens to distribute AMD64 and ARM32 images.
The project does not support CouchDB 3, and appears to be relatively inactive.

Most of the problems mentioned above are a direct result of CouchDB being a replicating database intended for use in clustered nodes.
We do not have clusters: every user has its own independent database.
Given how the majority of our issues stem from the database working exactly as intended,
we are opting to find a different database.

## Requirements

### Free and anonymous
Every user will be running their own instance.
Users should not have to create an account, and licence or subscription-based solutions will not be considered.

### Actively supported
An obvious, but important requirement.
The project should have the backing of an established and active company or open source collective.

### JSON documents
CouchDB is a JSON document store.
Choosing a replacement with a different storage paradigm would increase migration complexity and risk.

Brewblox deals with dynamic data models, and is subject to frequent changes.
We may reconsider in a future update, but for now, strict schema definitions would add too much overhead for too little gain.

Here, we don't want to fix what isn't broken. A document store works for us, and we'll stick with it.

### Local caching / ID indexing
Every client has its own database, and a very limited number (<500) of persisted objects.
The expected use case is to fetch all documents in a collection at startup, and then use a local data management system for lookups.

If there is a trade-off, we want to select the option optimized for selecting all objects in collection, and adding / modifying / removing a single object in collection.

### Push events
UI's share the global configuration state. If a change is made, it should be pushed to all other clients, using a web-compatible protocol and format.

### Memory footprint
Compared to the typical use case of many popular databases, we have very little data, and very little RAM available.
A running Docker container should use no more than ~50MB RAM.

### Ease of setup
The Docker image should not require setup calls to its API to be functional.
Preferably, it does not require a custom configuration file,
but this is a lesser priority.

### Ease of import/export
The API for exporting all data to file should be straightforward,
and symmetrical with the API for importing all files.

### Ease of implementation
The API should be easily implemented for all current clients:
- Browser-based TypeScript
- Node.js based TypeScript
- Asynchronous Python
- Synchronous Python

### Multiplatform Docker images
We deploy Brewblox to AMD64 and ARM32v7 platforms, with ARM64v8 being added in the medium-term future.
Multiplatform Docker images are being increasingly common.
If reasonably possible, we want our database solution to be on offer as first-party images for all three platforms.

## Candidates

The majority of relational databases (MySQL, MariaDB, SQL Server, PostgreSQL) immediately fail the multiplatform and memory footprint requirements.

The notable exception is [SQLite](https://www.sqlite.org/index.html), with the footnote that the required wrapper API will be counted against its memory footprint.

[TimescaleDB](https://docs.timescale.com/latest/main) is another potentially interesting RDBMS candidate,
as it would offer a unified database for configuration and time series data.
The downside is that implementing TimescaleDB would require us to migrate both our databases.
We have our issues with InfluxDB, but none of them justify a data migration.

Given how we want a JSON document store, NoSQL databases supply the other candidates.

[MongoDB](https://www.mongodb.com/) fails the memory footprint requirement (60MB empty), and [stopped supporting ARM32](https://www.dcddcc.com/blog/2018-06-09-building-mongodb-for-32-bit-ARM-on-debian-ubuntu.html).

[ElasticSearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/docker.html) and [Cassandra](https://cassandra.apache.org/)
both exceed the memory footprint requirement by orders of magnitude (1.5 and 4GB, respectively).

[Redis](https://redis.io/) is a key/value cache with optional persistence. It is simple, [popular](https://insights.stackoverflow.com/survey/2020#technology-most-loved-dreaded-and-wanted-databases), and extremely light-weight (5MB empty).

## Shortlist

**Redis** and **SQLite** are the two shortlisted databases,
mostly by virtue of requiring the least RAM.

Both offer support for JSON data through plugins ([Redis](https://redislabs.com/blog/redis-as-a-json-store/) / [SQLite](https://www.sqlite.org/json1.html)),
but our requirements would also be satisfied by storing data blobs as string.
In the case of SQLite, this would also skip the database schema.

Both would require API code: Redis uses plain TCP, and SQLite is an embedded database.

SQLite has no native publish mechanism, while Redis' [Pub/Sub](https://redis.io/topics/pubsub) is incompatible with web-based clients.
We already make extensive use of MQTT messaging.
It would be a small change to re-use it for database change events.
This has the added benefit of simplifying the connection model.

Either candidate would satisfy the requirements as listed.
Because we would be forcibly ignoring a core concept of SQLite (relational mapping), **Redis** has the edge.

This does not mean we can't change our mind. We'll first implement a Redis-based solution, and then evaluate it on the *develop* branch.
If any unforeseen problems arose, we can always switch to SQLite.
The MQTT-based synchronization remains the same, along with the basic CRUD functionality of the API.
It is not unlikely that a Redis -> SQLite changeover could be performed without refactoring the clients.

## Wrapper deployment

If we follow the principles of microservice design, then we'd add a dedicated service for interacting with our new database.

The drawbacks are the added complexity in development and deployment of the additional repository, and the increased fragility of the system as a whole.

An alternative is to add the API code to our existing database access API: brewblox-history.

This makes the `history` name somewhat awkward, but otherwise the design is sound.
The history service is and remains the gateway to the database.
We'd merely be adding more of the same responsibilities.

If the design is considered a success, we can rename the `brewblox-history` repository / `history` service in a future update.

## Planned changes

- Add `redis` service to serve as replacement for the CouchDB datastore.
- Implement CRUD API for the Redis datastore in the `brewblox-history` service.
- Publish change events over MQTT.
- Refactor client services to use the new API:
  - brewblox-ui
  - brewblox-devcon-spark
  - brewblox-automation
  - brewblox-ctl-lib
- Implement data migration on update.
- Ensure backwards compatibility for backup files.
- Evaluate implemented API; implement SQLite alternative if Redis is deemed suboptimal.
- (Later) rename `brewblox-history` to something more appropriate to its new role as generic database facade.
