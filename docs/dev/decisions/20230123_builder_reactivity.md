# Builder Reactivity

Date: 2023/01/23

## Context

A stated goal for the Builder is to slowly supplant and replace dashboards as the primary Brewblox interface.
For this to happen, the Builder must support all existing dashboard widgets.
Some of these widgets perform expensive or slow operations when mounted, making it more important that Builder components are re-rendered as sparingly as possible.

The two primary examples of "expensive" widgets are Graph and WebFrame.
Both must fetch network data before rendering.

## Stored and derived data

Rendered Builder data consist of both stored and derived data.
Individual properties for parts are stored, and transitions (potential flows), and actual flows are calculated on the fly.

Transitions are based on static properties (tube in/out locations), configurable settings (enabled flags, pressure settings, and dynamic tube configuration), and external properties (block fields).

While transitions are calculated independently per part, flow calculation is done using all parts and transitions as input.
While transitions (potential flow) remain unchanged if an adjacent part is added or removed, the actual flow almost always involves transitions from multiple parts forming an uninterrupted pipeline.

Because transitions and flows can be based on external properties,
they cannot be stored in the database, and must be derived.

## Flow calculation triggers

Transition and flow calculation takes between 20 and 100 ms, depending on layout complexity and hardware.
This is fast enough for it to be an automatic action, but too slow for it to be done in a Vue `computed` field.

Not all changes to part properties and settings will impact transitions. For example, editing a label text will never result in different part transitions.
Making this distinction would be both complex and liable to leak part implemenation details, and is expected to yield very marginal performance improvements. \
We can assume that new transitions should be calculated any time any part property changes.

Not all part changes have a local origin. Changes made in different clients or UI components are synchronized to all clients.

Individual parts can also explicitly call for a flow recalculation if external properties change.

To summarize, flow calculation should be triggered if:

- Part properties are changed.
- Part settings (`part.settings`) are changed.
- External layout or part changes are synchronized.
- Calculation is triggered explicitly by a part component.

## Additional requirements

Three additional requirements must be taken into account:

Smaller components must be rendered above larger components, allowing interaction for both parts. \
SVG does not support manual Z-indexing, making this a problem that must be solved by sorting parts by size.
If a smaller part always rendered above (later than) a larger part, both will have a clickable area when they overlap.

It is common for multiple parts to be changed simultaneously.
The UI supports selecting and then moving, copying, flipping, rotating or deleting multiple parts.
These batched changes should only trigger a single flow calculation and database update call.

Changes to parts must be rendered immediately, without waiting for the database roundtrip.
When moving parts, it significantly degrades UX if the parts only appear in their new position 100-1000ms after being dropped.

## Implementation

To satisfy the requirement that user changes are rendered immediately,
parts are stored in an independent (non-computed) property,
using manual two-way synchronization with the stored layout.

Whenever local part changes are made, they are pushed to the stored layout.\
Whenever external changes to the stored layout are reported, they are merged back into the local parts.

To prevent local parts changing a second time after a database roundtrip,
the local parts are only updated if the changed data is not deep equal to the current state.

To facilitate this comparison, no additional properties are added when hydrating parts: all part properties are persisted, and all non-persisted computed data is stored separately.

The flow calculation triggers discussed above are all based on the local parts.
The sorted representation of parts can be implemented as a read-only computed property, derived from the local parts.
The `v-for` used to render parts in the template is based on the sorted parts, but all part changes are applied to the local parts.

The [Immer](https://immerjs.github.io/immer/) library provides a convenient mechanism for batching multiple changes.
The producer function allows us to make multiple changes, and then apply them all as a single change to the parent layout.

Code example:

```ts
import produce from 'immer';

type Dict<T> = Record<string, T>;

const parts = shallowRef<Dict<BuilderPart>>({});

function updateParts(
  cb: (draft: Dict<BuilderPart>) => void | Dict<BuilderPart>,
): void {
  const updated = produce(parts.value, cb);
  parts.value = updated;
  reflow();

  builderStore.saveLayout({
    ...layout.value,
    parts: Object.values(updated),
  });
}
```

To atomically move all parts one square to the right, we can then call:

```ts
updateParts((draft: Dict<BuilderPart>) => {
  for (const id in draft) {
    draft[id].x += 1;
  }
});
```
