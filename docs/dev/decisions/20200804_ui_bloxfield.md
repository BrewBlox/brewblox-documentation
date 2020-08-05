# UI implementation of typed objects

Date: 2020/08/04

## Context

As part of the introduction of the automation scripting sandbox,
we have been re-evaluating [typed fields](./20200723_typed_fields).

This includes lessons learned from implementing quantity handling in automation, and the new requirements for interface definitions.
With the introduction of the scripting API, block interfaces become public, and need to be well-documented.

The UI implementation was designed with now outdated constraints and requirements in mind.
To prevent technical debt and inexplicable design decisions,
we're refactoring the implementation.

## Automation implementation

The `qty()` function in the sandbox API has a different set of requirements than the UI implementation,
but is useful as a reference.

Some conclusions:

The `qty()` constructor needs to accept four distinct sets of arguments:
- Raw objects with a `"__bloxtype": "Quantity"` field.
- Objects previously created with `qty()` (`qty(qty(...))` must be valid).
- Value/unit arguments: `qty(10, 'degC')`.
- Duration strings: `"5h 10m 8s"`.

Quantity / Link manipulation functions should not modify the base object, but always return a copy.

The Quantity object should implement a .toJSON() function that returns a typed object.
This saves explicitly having to convert / sanitize all data before feeding it to an API after function calls such as:
```javascript
block.data.value = qty(10, 'degC');
```

Duration strings can best be converted to values in seconds in the `qty()` constructor.
Afterwards, quantities can be converted using the [js-quantities](https://github.com/gentooboontoo/js-quantities) library.
When converting, we can use some regex to "translate" units from our current notation to those accepted by js-quantities.

We use the [Pint](https://pint.readthedocs.io/en/stable/) library in python services to handle unit conversion, and have implemented its naming conventions for units throughout our data.
Pin refers to absolute temperatures as `degC/degF/degK`, and to relative temperatures as `delta_degC/delta_degF`. `delta_degK` does not exist because 0 Kelvin is not an offset.

js-quantities prefixes absolute temperatures with `temp`: `tempC/tempF/tempK`. The `deg` prefix is used for relative temperatures: `degC/degF/degK`.

These rules are consistent enough that we can use a generic regex conversion before sending values to be converted.

## serialize() / deserialize()

Current behavior is for the UI to feed all outgoing and incoming data through the symmetric `serialize()` and `deserialize()` functions to convert to and from Javascript Quantity / Link class instances.

This adds a layer of complexity we'd rather skip.
If no key manipulation is required, and Quantity / Link classes implement a `toJSON()` function,
then this already eliminates the need for a special `serialize()` function.

The need for a `deserialize()` function remains.
Backwards compatibility is a requirement, and previously exported data used the postfix notation for typed fields.

This does leave us with a design decision to be made: does `deserialize()` convert typed fields into instances of the Quantity/Link classes, or into typed objects?

## Typescript interfaces

One significant argument in favor of using raw objects in block data is how they are typed.

To reduce fragmentation, we want to use the Typescript interfaces as a source for the sandbox API documentation.
This gets more complicated if many block objects refer to a class that's not implemented or available in the sandbox.

If we declare objects as raw data types in Typescript, and then habitually upcast them "because we know it's a Link/Quantity anyway",
then we introduce some terrible coding practices in the UI.

## Performance

The most common use case is for a user to be primarily using his/her dashboards,
and only visit the Spark page when advanced configuration is required.

Few -if any- block widgets are included on a typical dashboard.
Most typed objects in block data will never require parsing,
rendering, converting, or any other functions added by the Quantity / Link classes.

If operations are done lazily by individual elements,
then this is likely to be more efficient than if they are done once centrally.

This conclusion does come with the qualification that data serialization is not currently considered a performance bottleneck.
The creation of <100 Quantity / Link objects every few seconds is relatively insignificant.

## toString()

Class objects can implement a `toString()` function that is automatically called when an element is rendered as string or shown in Vue moustaches.

Raw typed objects do not have a `toString()` function, and would require explicit processing before rendering.

In Javascript that would take the form of wrapping the object:
```javascript
const text: string = `block value: ${qty(block.data.value)}`;
```

In Vue, the recommended solution is to use a filter:
```
<div>
    {{ block.data.value | quantity }}
</div>
```

This needs to be done consistently throughout the UI.
It is not impossible, but requires meticulously checking UI behavior after refactoring.

The upsides are that future refactoring of how typed objects are rendered is made easier, and that the cost of bugs here is relatively low.
A rendering error is annoying, but is not likely to break functionality.

## Conclusions

Consistency in Typescript interfaces is a convincing argument to keep raw data the same throughout the system, and wrap typed objects at point of use.

Performance is likely to be better if typed objects are processed at point of use, but the impact is negligible.

Consistently applying this everywhere in the UI will take some effort,
but this is likely to be worth it.

The overall conclusion is that the default shape of typed objects in `block.data` should be the raw object.
We wrap and render the typed object at point of use.

## Changes

- The JS classes implement `toJSON()` functions that return typed objects.
- The `serialization()` function is phased out
- `deserialization()` is still applied to sources that may include postfixed fields (datastore, file imports).
- `deserialization()` generated typed objects, not JS classes.
- Typed objects are evaluated at point of use:
  - A `qty()`-like function is introduced that accepts other quantity objects, value/unit arguments, or duration strings, and returns a Quantity class.
  - A `link()`-like function is introduced that accepts other link objects or id/type arguments, and returns a Link class.
  - Vue filters are added to render Quantity / Link objects in moustaches.
- Typescript interfaces are cleaned up to be reusable outside the UI.
