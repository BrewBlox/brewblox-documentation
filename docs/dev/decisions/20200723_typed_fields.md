# Serializing type information in block fields

Date: 2020/07/23

## Context

Spark block data includes two types of special fields: Quantities and Links.
A Quantity may be `20 degC`, and a Link could be `TempSensorOneWire sensor-1`.

The implementation and required fields are different, but both share some characteristics:
- They are serialized as a single value in Protobuf
- They require metadata (unit, object type) to be meaningful
- The additional fields are mutable, and required when JSON data is converted to Protobuf input.

In the case of quantities, the metadata is also highly relevant when storing the value as history data: 20 degC != 20 degF.

Originally, we resolved this issue by storing the type information and metadata as part of the key name.
Quantities are postfixed with the unit name in square brackets: `{"value[degC]": 20}`.
Links are postfixed with the object type in angular brackets: `{"sensor<TempSensorOneWire>": "sensor-1"}`.

A scenario where a variable key name is problematic is the new automation scripting API.
It would be extremely cumbersome and error-prone for end users to have to determine what the correct postfix is every time they read or write a value.

## Typed objects

In the UI, all incoming block data is processed, and Quantities and Links are converted into class objects that contain the value, metadata, and computed values.

Rather than adding a processing step to the automation service,
we're partially replacing the approach of postfixed values.

This ensures that block data has a consistent format, regardless of source (MQTT event, REST API, or automation script).

The data format is still limited by what can be serialized to JSON.
If we can identify the "type" of JSON objects, we can apply the correct processing function in consumers (UI and Spark service).

A simple way to do this is to add a magic field to each object.
The name is not too important, as long as it's consistent, and reasonably unique. In this case, it will be `__bloxtype`.

Based on the value of `__bloxtype`, other fields are expected in the object.

```typescript
interface Quantity {
    __bloxtype: 'Quantity';
    value: number | null;
    unit: string;
    readonly?: boolean;
}

interface Link {
    __bloxtype: 'Link':
    id: string | null;
    type: string;
    driven?: boolean;
}
```

Example objects (not including optional fields): 

```typescript
const quantity: Quantity = {
    __bloxtype: 'Quantity',
    value: 20,
    unit: 'degC',
};

const link: Link = {
    __bloxtype: 'Link',
    id: 'sensor-1',
    type: 'TempSensorOneWire',
};
```

## Compatibility

The two notations for Quantity and Link objects are independent.
Block data can have one field using a postfix, and the other using a typed object.
The Spark service and the UI will support both when parsing data, but will favor the new approach when generating data.

## History

One area where the postfixed notation is and remains useful, is history.
Each line in a graph is a key/value pair where the value is required to be a number.
Here, `value[degC]` as key name is both informative and elegant.
A welcome side effect is that when the user updates his unit preferences, it will cause the new data to be placed in a different column, as the key just changed from `value[degC]` to `value[degF]`.

For the Spark service, this does not require meaningful changes.
History data and current block state are already published using separate events, as all non-logged fields have to be stripped from history data.

## Changes

- A new format is introduced for Quantity and Link data.
- UI and Spark service can read both postfixed and typed objects.
- UI and Spark will use typed objects when converting blocks to JSON.
- Spark history data will continue to use the postfixed notation.
