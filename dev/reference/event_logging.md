# InfluxDB Event Logging

Historic state of controllers should be written to a time-series database (influx) for later display to users.


## Decoupling

In order to decouple individual controllers and the history database, logging is done through events.
Controllers publish events with their latest state, without knowing who reads it.

The history service subscribes to these events, and writes the raw data to the database in a sensible manner.

This way the controller services are not aware of the history service implementation, and the history implementation is not aware of controller service implementation details.

## Data Structure

After a subscription is set, it will relay all incoming messages (as described under [Decoupling](#Decoupling)).

When relaying, the data dict is flattened.
The first part of the routing key is considered the data source name, and becomes the InfluxDB measurement name.

All subsequent routing key components are considered to be sub-set indicators of the data source.
If the routing key is controller1.block1.sensor1, we consider this as being equal to:

```python
'controller1': {
    'block1': {
        'sensor1': <event data>
    }
}
```

Data in sub-dicts (including those implied by routing key) is flattened.
The key name will be the path to the sub-dict, separated by /.

If we'd received an event where:

```python
routing_key = 'controller1.block1.sensor1'
data = {
    'settings': {
        'setting': 'setting'
    },
    'values': {
        'value': 'val',
        'other': 1
    }
}
```

it would be flattened to:

```python
{
    'block1/sensor1/settings/setting': 'setting',
    'block1/sensor1/values/value': 'val',
    'block1/sensor1/values/other': 1
}
```

If the event data is not a dict, but a string, it is first converted to:

```python
{
    'text': <string data>
}
```

This dict is then flattened.