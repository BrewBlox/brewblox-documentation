# Storage and downsampling of history data

Brewblox history data is stored in a [InfluxDb](https://www.influxdata.com/) Time-Series Database (TSDB).
For performance and storage size, values are progressively downsampled.

To deal with technical limitations of InfluxDB, this involves some custom conventions.
This reference document assumes a familiarity with [InfluxDB 1.8 concepts](https://docs.influxdata.com/influxdb/v1.8/).

## Note on InfluxDB 1.x vs 2.0

The latest InfluxDB version 2.0, which is a major upgrade from 1.8.
This includes a rework of some storage paradigms, and the new Flux query language.

A problem is that [Influx 2.0 will not support 32-bit architectures](https://www.influxdata.com/blog/influxdb-oss-and-enterprise-roadmap-update-from-influxdays-emea/).
Raspberry Pi OS uses the ARM32 architecture, making this a dealbreaker for Brewblox.

InfluxDB 1.8 is supported until the end of 2021. We are actively looking at alternatives to replace it.

## Downsampling and retention policies

To avoid services that publish with a high frequency from flooding the database,
and to preserve performance when data spanning a long period is requested,
values are progressively downsampled.

There are five tiers of downsampling, each with their own retention policy:
- `autogen` (data as published, not downsampled yet)
- `downsample_1m`
- `downsample_10m`
- `downsample_1h`
- `downsample_6h`

Data in the `autogen` policy is kept for 1d. All other policies retain data indefinitely.

Downsampling is done using continuous queries.
Every $PERIOD the mean of new values in the previous downsampling tier is calculated, and inserted as new point.
The timestamp of the inserted point is the current time and date.
Values in downsampled policies will always be the mean of points published in the period preceding the timestamp.

An example scenario:
- Data is published and inserted into `autogen` every 5s (t=0s, t=5s, t=10s, etc.).
- At t=1m, a new point is inserted into `downsample_1m`.
  - Source: values from `autogen` with timestamp 0s, 5s, 10s...1m.
- At t=10m, a new point is inserted into `downsample_10m`.
  - Source: values from `downsample_1m` with timestamp 1m, 2m, 3m...10m.
- At t=1h, a new point is inserted into `downsample_1h`
  - Source: values from `downsample_10m` with timestamp 10m, 20m, 30m...1h.
- At t=6h, a new point is inserted into `downsample_6h`
  - Source: values from `downsample_1h` with timestamp 1h, 2h, 3h...6h.

## Measurement naming scheme

The fully qualified name for a measurement is `DATABASE.RETENTION_POLICY.MEASUREMENT`.

The **Database** value is hardcoded to be `brewblox`.

Used **retention policies** are explained above. Published data is always inserted into the `autogen` policy.

**Measurement** is expected to equal the service ID, but is ultimately defined by the published data.
When [publishing history data](./history_events), the `key` field is required.
When inserting data, `key` is used as measurement name.

For example, data from the Spark service *spark-one* will be inserted in the `brewblox.autogen.spark-one` measurement,
and can be fetched from:
- `brewblox.autogen.spark-one`
- `brewblox.downsample_1m.spark-one`
- `brewblox.downsample_10m.spark-one`
- `brewblox.downsample_1h.spark-one`
- `brewblox.downsample_6h.spark-one`

## Field names in autogen

The `data` field in published data is flattened before it is inserted into the database.
The key to all values is set as a /-separated path that includes the key of all parent objects.

The data in this event...

```json
{
    "key": "controller1",
    "data": {
        "block1": {
            "sensor1": {
                "settings": {
                    "setting": "setting"
                },
                "values": {
                    "value": "val",
                    "other": 1
                }
            }
        }
    }
}
```

...is flattened to:

```json
{
    "block1/sensor1/settings/setting": "setting",
    "block1/sensor1/values/value": "val",
    "block1/sensor1/values/other": 1
}
```

## Field names in downsampled policies

There is a long-standing [issue](https://github.com/influxdata/influxdb/issues/7332) in Influx where it is impossible to
have a continuous query using wildcard fields and aggegration that
inserts a new point with the exact same field name as the source values.

**For every level of downsampling, the field name is prefixed with an additional m_**

For example, given the field `value`, the actual field name in various policies will be:
- `autogen` -> `value`
- `downsample_1m` -> `m_value`
- `downsample_10m` -> `m_m_value`
- `downsample_1h` -> `m_m_m_value`
- `downsample_6h` -> `m_m_m_m_value`

When subscribing through data through the brewblox-history API, these prefixes are stripped automatically from the output.
If you are manually querying the Influx database, you will need to handle this yourself.

## Reference continuous query

To give an example: the continuous query used to insert points into the `downsample_10m` policy is declared as:

```
CREATE CONTINUOUS QUERY \
cq_downsample_10m \
ON brewblox \
BEGIN \
  SELECT mean(*) AS m \
  INTO downsample_10m.:MEASUREMENT \
  FROM downsample_1m./.*/ \
  GROUP BY time(10m),* \
END;
```
