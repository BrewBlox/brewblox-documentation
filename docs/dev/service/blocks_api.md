# Spark blocks API

A central component of Brewblox systems is the Spark controller.
Custom services that wish to read or write blocks will typically interface with the Spark service API to do so.

This document assumes familiarity with the [Block data types](../reference/block_types).

:::tip
Spark service endpoints are documented using Swagger.
For comprehensive endpoint documentation, navigate to `http://{HOST}/{SERVICE_ID}/api/doc` in your browser.
:::

## Hostname

From a Brewblox service, you can access Spark service endpoints at `http://{SERVICE_ID}:5000`.
This is explained in more detail in the [routing doc](./routing).

## Declarative configuration

Blocks are configured entirely by declaring their configuration, and don't have any functions.
Block updates are idempotent: writing a block update multiple times has the same effect as doing it only once.

Block writes should include the entire new desired state for the block.
If values are omitted, the default is used. Typically this is `0`, and this is often undesirable.
Patch functions merge the patch with the last known state of the block, and then write the block.

Readonly values can safely be included or omitted when writing blocks: they will be silently ignored.

## CRUD endpoints

The block API endpoints for CRUD operations are:

- POST `/{SERVICE_ID}/blocks/create`
- POST `/{SERVICE_ID}/blocks/read`
- POST `/{SERVICE_ID}/blocks/write`
- POST `/{SERVICE_ID}/blocks/patch`
- POST `/{SERVICE_ID}/blocks/delete`
- POST `/{SERVICE_ID}/blocks/all/read`
- POST `/{SERVICE_ID}/blocks/all/delete`

The `create`, `write`, and `patch` endpoints should be called with a block as request body.
For the `create` and `write` functions, `Block.data` should be complete.
For `patch`, this field will be merged with the last known values.

`read` and `delete` can also be called with a block as request body, but `{ id: string; }` suffices.

The `create`, `read`, `write`, and `patch` endpoints all return a block.

`all/read` and `all/delete` unsurprisingly return and delete all blocks, respectively.

## Block discovery

Some blocks are not created, but discovered.
Typically, these are related to plugged-in sensors or IO modules.

Discovery must be triggered by sending a POST request to `/{SERVICE_ID}/blocks/discover`.
This happens whenever the UI is loaded, but you may also wish to do it manually.

The first call to `discover` returns the newly discovered blocks (if any).
From then on, these blocks are present in state updates, and in the return value from `/{SERVICE_ID}/blocks/all/read`.

## Backups

Two endpoints are available for exporting and importing controller block state:

- POST `/{SERVICE_ID}/blocks/backup/save`
- POST `/{SERVICE_ID}/blocks/backup/load`

`backup/save` will return the persistent data of all current blocks, along with the contents of the Spark datastore.

`backup/load` must be called with the output from `backup/save` as request body, and will restore the exported state.
This is not a merger: any and all blocks not present in the exported state will be removed.

## Logged and stored block data

Block data has two subsets: logged and stored data.

Logged data consists of the fields that are published to the history service.
This does not include string values, links, arrays, and some of the more persistent settings.

Stored data are the values persisted to EEPROM storage by the controller.
Backups, for example, use stored data.

Computed values such as achieved values, remaining constraint time, and PID integrator buildup are not stored.

Logged and stored data for one or more blocks can be fetched using the following endpoints:

- `/{SERVICE_ID}/blocks/read/logged`
- `/{SERVICE_ID}/blocks/read/stored`
- `/{SERVICE_ID}/blocks/all/read/logged`
- `/{SERVICE_ID}/blocks/all/read/stored`

## Using State / history events

The Spark service periodically emits [State](../reference/spark_state) and [History](../reference/history_events) events.
The full spec is described in their respective documents, but there are some implications for using them in other services.

State events are emitted every ~5s, and whenever the service disconnects.
This makes them useful for implementation of value-based triggers.

History events are also emitted every ~5s, but there are some critical differences with State events that make them less suitable for general purpose usage:
- History events only include logged data. This is a subset that does not include relevant information such as links.
- History events are not [retained](https://www.hivemq.com/blog/mqtt-essentials-part-8-retained-messages/).
- No History event is published to notify clients of a service shutdown.
- Quantities in History events are serialized as postfixed values, and not as objects. An example `value` field will be present as `value[degC]` or `value[degF]`.

## MQTT block writes

To support scenarios where clients are connected to the eventbus,
but are unable or unwilling to use the REST API, a rudimentary block API can be used by publishing MQTT events.

Spark services listen to the following MQTT topics:
- `brewcast/spark/blocks/create`
- `brewcast/spark/blocks/write`
- `brewcast/spark/blocks/patch`
- `brewcast/spark/blocks/delete`

All listeners expect a JSON-serialized body as payload.
The argument requirements are the same as those of their REST counterparts, with one exception.

In contrast with the REST API, the topics do not include service IDs.
The JSON payload for all events must include the `serviceId` field.

The `Block` interface already includes `serviceId`, so this changes nothing for the `create`, `write`, and `patch` endpoints.
The `delete` endpoint now requires an object matching `{ serviceId: string; id: string; }`.
