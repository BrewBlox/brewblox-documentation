# Datastore API

Brewblox uses two shared databases: a [Victoria Metrics](https://victoriametrics.com/) Time-Series Database for [history data](./history_events.md),
and a key/value [Redis](https://redis.io/) database for configuration.

We [selected](../decisions/20200902_redis_datastore.md) Redis because it is a lightweight schemaless database without frills.
This works well for us, but we had to add some custom functionality in the API to fully implement desired features.

## API service

:::tip
Service endpoints are documented using Swagger.
For comprehensive endpoint documentation, navigate to `http://{HOST}/history/api/doc` in your browser.
:::

The `history` service implements the REST-based API wrapper for performing CRUD operations.
Services are not supposed to connect to the Redis database itself.

The history service offers the following endpoints:

- GET `/history/datastore/ping`
- POST `/history/datastore/get`
- POST `/history/datastore/mget`
- POST `/history/datastore/set`
- POST `/history/datastore/mset`
- POST `/history/datastore/delete`
- POST `/history/datastore/mdelete`

## Namespaces

Brewblox uses a namespace-based naming convention to group datastore documents.
Namespaces are `:` separated, and can be nested.
The last section of the key is considered the document ID.

A key may include zero, one, or multiple namespaces.
Examples of some valid key names:

- `id`
- `group:id`
- `group:subgroup:id`

While it's technically not required, we strongly recommend using a namespace for your data.

## Data schema(less)

All documents are expected to be valid JSON objects, and are stored as string.
Consequently, the datastore does not support queries based on the content of documents.

Documents must implement the following interface:

```typescript
interface Document {
  id: string;
  namespace: string;
}
```

The *id* field can only contain letters, numbers, and `-` / `.` / `_` / `~` characters.

*namespace* can also include `:`.

It is valid for *namespace* to be empty, but not for *id*.

The relevant regular expressions would be:

- id: `^[\w\-\.~]+$`
- namespace: `^[\w\-\.~\:]*$`

::: details Example documents

```json
{
  "namespace": "brewblox-ui-store:dashboard-items",
  "id": "117a2504-85b7-43c4-a48d-37bf5d6821cd",
  "feature": "Stopwatch",
  "order": 9,
  "config": {
    "session": null
  },
  "rows": 2,
  "title": "Stopwatch",
  "dashboard": "dashboard-home",
  "cols": 4
}
```

```json
{
  "namespace": "brewblox-global",
  "id": "units",
  "temperature": "degC"
}
```

```json
{
  "namespace": "spark-service",
  "id": "spark-one-service-db",
  "data": {
    "autoconnecting": true,
    "retry_interval": 2
  }
}
```

:::

## Change events

Whenever an API call changes or deletes document(s), this is published to the eventbus.

The base MQTT topic is `brewcast/datastore`.
Change events are grouped by top-level namespace, and the top-level namespace is appended to the MQTT topic.

For example, if a call to `history/datastore/mset` changes documents in `namespaceA`,
`namespaceA:subgroup` and in `namespaceB`, two separate events are published:

- `brewcast/datastore/namespaceA`
- `brewcast/datastore/namespaceB`

The payload of change events is a serialized JSON object.

```typescript
interface ChangeEvent {
  changed: Document[];
}

interface DeleteEvent {
  deleted: string[]
}

type DatastoreEvent = ChangeEvent | DeleteEvent;
```

If the call created or changed one or more documents, the new documents are listed in `event.changed`.

If the call deleted one or more documents, their full key (namespace + id) is listed in `event.deleted`.

An event always includes either a change, or a deletion - never both.
If no documents were changed or deleted, no event is published.

::: details Example events
Topic: `brewcast/datastore/brewblox-global`

```json
{
  "changed": [
    {
      "namespace": "brewblox-global",
      "id": "units",
      "temperature": "degC"
    }
  ]
}
```

Topic: `brewcast/datastore/brewblox-ui-store`

```json
{
  "deleted": [
    "brewblox-ui-store:dashboard-items:117a2504-85b7-43c4-a48d-37bf5d6821cd",
    "brewblox-ui-store:layouts:68426d4c-edb9-4616-b13c-c6dbabbec725"
  ]
}
```

:::

## Avoiding namespace collisions

We strongly recommend picking an explicit namespace that is unique to your service.
**Do NOT use** a generic term such as `settings`, `config` or `_` as top-level namespace.
