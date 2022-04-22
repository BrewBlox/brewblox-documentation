# InfluxDB to Victoria Metrics

Date: 2021/07/18

## Context

Brewblox uses two databases: one for configuration, and one for time-series history data.
The configuration database already has seen a [migration from CouchDB to Redis](./20200902_redis_datastore.md),
but Brewblox has only ever used InfluxDB as history database.

In may 2021, InfluxDB [announced](https://www.influxdata.com/blog/influxdb-oss-and-enterprise-roadmap-update-from-influxdays-emea/)
that no 32-bit version of InfluxDB 2.0 will be released.
Support for InfluxDB 1.8 (the last 32-bit compatible version) ends in Q4 2021.

This is a deal-breaker for us. While we agree that 64-bit is the way forward, our primary target platform is the Raspberry Pi,
which will have first-class 32-bit support for some years to come.

This document serves as an executive summary of the choices made during the selection process.
It does not include an exhaustive description of all options and tests, and does not list the various databases that were considered and immediately found wanting.

## InfluxDB shortcomings

While InfluxDB is perfectly functional, there are some kinks and annoyances that we'd prefer not to deal with in its successor.

### Prefixes

First and foremost is that the continuous queries used for downsampling always prefix the key name.

There is a long-standing [issue](https://github.com/influxdata/influxdb/issues/7332) in Influx where it is impossible to
have a continuous query using wildcard fields and aggegration that
inserts a new point with the exact same field name as the source values.

For example, given the field `value`, the actual field name in various policies will be:

- `autogen` -> `value`
- `downsample_1m` -> `m_value`
- `downsample_10m` -> `m_m_value`
- `downsample_1h` -> `m_m_m_value`
- `downsample_6h` -> `m_m_m_m_value`

This required custom handling in our history service, and made data less accessible for power users who wished to do custom data analysis.

Having to dynamically strip multiple `m_` prefixes is an incredibly ugly hack that we do not wish to repeat.

### Schema definition and field presence

The dynamic nature of [publishing history data](../reference/history_events.md) means that the database schema is completely dynamic, and may see keys appear and disappear.

A key is present in an influx measurement if it has at least one value.
This means we could distinguish between two sets of fields:
those with at least one published point in the last 24 hours (the `autogen` retention policy), and those with at least one published point *ever*.

This is a very coarse distinction, to the detriment of UX.

### Import/Export symmetry

Apart from catch-all [debug tools](https://docs.influxdata.com/influxdb/v1.8/tools/influx_inspect/#export), Influx lacked support for symmetrical import/export.

This hindered targeted backups and data migration between setups.

### Runtime setup

In order to set up incremental downsampling, multiple runtime calls had to be made at least once.
If for any reason the user deleted the `influx/` directory, this had to repeated.

In the end, running database configuration every update proved reasonably sufficient, but we'd rather not have to.

## Requirements

- must: ARM32/ARM64/AMD64 Docker images
- must: <500 MB RAM
- must: dynamic schema definition
- must: actively supported
- must: free without license keys
- must: single-container application
- must: REST API or asyncio Python client library
- nice: <200 MB RAM
- nice: user-friendly REST API
- nice: support for common third-party tools such as Grafana
- nice: no runtime setup required

## Scaling

A common issue when selecting any kind of database is that Brewblox is an on-premise system that runs on very constrained hardware, and expects almost trivial data loads.

Database vendors like to advertise their suitability for distributed deployments at scale.
A typical benchmark runs on a beefy server with 32+ GB of RAM, and measures how quickly billions of points are ingested.

Brewblox does not use beefy servers, has no immediate plans for multi-node synchronized database deployments, and expects to ingest tens or hundreds of data points per second - not thousands or millions.

## Candidates

There is a significant number of time-series-compatible databases out there.
Most of them were disregarded immediately because they either do not offer 32-bit support, or because their memory footprint exceeds the 1GB available on a Raspberry Pi 3.

Three serious candidates emerged:

- [TimescaleDB](https://www.timescale.com/), a modified version of PostgreSQL.
- [Prometheus](https://prometheus.io/), a popular open source database with its own query language.
- [Victoria Metrics](https://github.com/VictoriaMetrics/VictoriaMetrics), a drop-in replacement for Prometheus that advertises reduced memory usage.

The title spoils the ending, but we'll go through our reasoning anyway.

**TimescaleDB** is built on the thoroughly reliable PostgreSQL, but assumes that the database schema is known in advance.
While we acknowledge that in most scenarios this is a good design choice, Brewblox still explicitly and irrevocably uses a dynamic database scheme.

While it is possible to insert dynamic JSON data, it would go against the design of the database, resulting in unoptimized read/write queries.

**Prometheus** deals in single-value columns, which is an approach much more suited to sparse groupings of data.
This more closely matches data as published, and provides better feedback on which fields are stale (one of our gripes with InfluxDB).

**Victoria Metrics** implements the Prometheus query API, while promising [7x less memory usage](https://valyala.medium.com/prometheus-vs-victoriametrics-benchmark-on-node-exporter-metrics-4ca29c75590f). It also has a significantly smaller Docker image (20MB vs 192MB).

TimescaleDB was first discarded. It requires a workaround for dynamic data schemas - an issue natively supported and expected by the others.

Prometheus vs Victoria Metrics was a harder choice. Prometheus is the more mainstream option, while Victoria Metrics uses about half the RAM when faced with expected I/O rate.

In the end, we judged that the support behind Victoria Metrics is good enough for us, and that we'd rather go with the database that has the smallest footprint when dealing with expected traffic volumes.

This is not to say we're wedded to this choice. We'll further evaluate it during and after implementation.
The thorniest issue is user data migration. It is relatively easy to change direction while the implementation is still in development.

## Downsampling

[Victoria Metrics on downsampling support](https://github.com/VictoriaMetrics/VictoriaMetrics#downsampling):

> There is no downsampling support at the moment, but:
>
> - VictoriaMetrics is optimized for querying big amounts of raw data. See benchmark results for heavy queries in [this article](https://medium.com/@valyala/measuring-vertical-scalability-for-time-series-databases-in-google-cloud-92550d78d8ae).
> - VictoriaMetrics has good compression for on-disk data. [See this article](https://medium.com/@valyala/victoriametrics-achieving-better-compression-for-time-series-data-than-gorilla-317bc1f95932) for details.
>
> These properties reduce the need of downsampling. We plan to implement downsampling in the future. See [this issue](https://github.com/VictoriaMetrics/VictoriaMetrics/issues/36) for details.

Downsampling in InfluxDB was done for three reasons:

- conserving disk space
- reducing round-trip time when fetching a large dataset over a long period
- reducing query output size when querying a large dataset over a long period

This came at the cost of additional complexity in the history service, and the aforementioned prefix problems.

When considering solutions, a trade-off is acceptable.
We would be happy to settle for slightly worse performance if it means we can forego the complexity and overhead of parallel data sets.

To test the claims about performance, we used a simple algorithm to estimate optimal query granularity.

```python
# query_start and query_end are both Unix second timestamps
def calculate_step(query_start: int, query_end: int) -> int:
    DESIRED_POINTS = 1000
    MINIMUM_STEP_S = 10
    query_duration_s = query_end - query_start
    desired_step_s = query_duration_s // DESIRED_POINTS
    step = max(desired_step_s, MINIMUM_STEP_S)
    return step
```

If we average the dataset, with batch sizes of `step` duration,
we will get a result set of between 0 and 1000 values, depending on how sparse the dataset is.
To prevent sub-second step durations for short queries, there is a lower bound of `10s`.

`calculate_step` is a quick-and-dirty solution for the third goal of downsampling (reducing query output size).
Tests using this algorithm suggested that Victoria Metrics performance was not a bottleneck when graphing 50+ metrics over 6 months.

We have more testing and tuning to do before we're comfortable releasing this to end users,
but these feasibility tests suggest that data downsampling can be done in query.
This significantly reduces complexity in data handling,
and makes it easier for end users to perform custom data processing and analytics.

## Field name conventions

In InfluxDB, the service name (`key` in history events) served as measurement name.
Field names to nested values were automatically flattened to `/`-separated paths.

Victoria Metrics has no concept of *measurement*, and all fields are top-level objects within the database.

The simplest solution is to prefix the field name with the service name.
Where first you'd have the `sensor/value` and `sensor/offset` fields within the `spark-one` measurement,
now you'll have the `spark-one/sensor/value` and `spark-one/sensor/offset` fields.

## Backwards compatibility

Backwards compatibility is a concern in four areas:

- On-disk files created by InfluxDB
- Published history events
- History service REST API
- Persistent UI widget configuration

The files created by InfluxDB are not compatible with Victoria Metrics,
and Victoria Metrics does not offer built-in tooling to read and convert them.
**Existing history data must be exported and imported.**

The [spec](../reference/history_events.md) for publishing history data is equally convenient for both InfluxDB and Victoria Metrics.\
**No changes are required to the history event spec.**

We consider the history service REST API as semi-private, and the schema used by the Prometheus/Victoria Metrics API is somewhat nicer to work with.
Converting all query results to the previous format would negatively impact performance, memory footprint, and code readability, for very questionable gain.\
**The new history API endpoints will NOT be backwards compatible.**

Graph/Metric configuration is part of multiple widgets in the UI.
The conversion rules are also relatively simple: `{ measurement: string; fields: string[]; }[]` must be flattened to `string[]`.
This is a one-liner conversion if done at point of use.\
**UI graph configuration will be unchanged, and converted at point of use.**

## Data migration

History data migration must be done runtime, with active containers for both InfluxDB and Victoria Metrics.
`brewblox-ctl` is best suited for the implementation of a one-off command that uses both shell commands and a REST API.

The previous automated data migration (CouchDB to Redis) has caused problems in the past, and is becoming increasingly brittle as time goes by.
History data is also not critical for operation of the system in the way that configuration data is.

For these reasons, history data will not be migrated automatically during the first update. The update will instead prompt users to call the migration command when it is convenient to them.

We'll have to pay careful attention to making this prompt noticeable, and the migration command itself intuitive.
The prompt may be drowned out by other messages during the update,
and it is not unlikely for users to start the update and then step away from the computer.

## CSV export

Victoria Metrics supports CSV exports, but the [format](https://github.com/VictoriaMetrics/VictoriaMetrics#how-to-export-csv-data)
will not group values that share a timestamp.

We'll have to implement our own CSV export endpoint in the history service if we want a format where field names are part of the header.

## Future functionality

Due to its very different architecture and query language,
some features that were problematic or impossible in Influx may be implemented easily in Victoria Metrics.

### Functions other than average

Because downsampled data is calculated on the fly, we may offer users the option to use a different function than the default `avg_over_time()`.

A list of drop-in replacements can found [here](https://prometheus.io/docs/prometheus/latest/querying/functions/#aggregation_over_time).

### Exported history data in backup

Victoria Metrics offers symmetrical [export/import APIs](https://github.com/VictoriaMetrics/VictoriaMetrics#how-to-export-time-series).
We may make use of them to (for example) export the last month of history data when making a backup.
