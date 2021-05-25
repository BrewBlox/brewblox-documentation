# Using Vue composition API

Date: 2021/05/02

## Context

The Brewblox UI is a Single Page Application (SPA) built using the Vue and Quasar frameworks.
At the time of writing, [Vue 3](https://v3.vuejs.org/guide/introduction.html#what-is-vue-js) is about to be released.

The advertised benefits of Vue 3 match our use cases quite well.
Typescript support is now a core feature, and the new composition API aims to improve code reuse for larger codebases.

Quasar is implementing Vue 3 support as part of its own major update.
Apart from "things now work with Vue 3", there are no must-have features for us in this version.

In this document, we'll discuss the motivation for this significant refactor,
and the resulting changes to component architecture and design patterns.

## Class components

In the Vue 2 version, the Brewblox UI combines Typescript with [vue class components](https://github.com/kaorun343/vue-property-decorator).
This solves some of the issues identified and fixed by Vue 3 [composition API](https://v3.vuejs.org/guide/composition-api-introduction.html),
but suffers from its own set of drawbacks.

The advantages are that it produces cleaner code (less nesting) and improved Typescript support.
It also allows for grouping code by concern, as fields (data), getters (computed), and methods can be declared in any order throughout the class.

The biggest disadvantage is that it is an additional layer that developers and transpilers must account for.
When writing non-trivial components, developers must understand both the class-based API, and the underlying Vue options API.
As it is an alternative syntax, IDE support will lag behind.

In this regard, the Vue 3 composition API promises the best of both worlds: typed component definitions as a native and recommended feature.

## Reactivity

[Vue 2 reactivity](https://vuejs.org/v2/guide/reactivity.html) is an excellent and unobtrusive feature, but comes with some drawbacks.
Chief among them is the inability to track new values in arrays and objects.
This introduced a new class of bugs: objects that were unexpectedly (non-)reactive.

[Vue 3 reactivity](https://v3.vuejs.org/guide/reactivity.html) solves this by using Proxy objects.
We can now create reactive primitives and objects by using [ref() and reactive()](https://www.danvega.dev/blog/2020/02/12/vue3-ref-vs-reactive/).

The explicit declaration and typing helps to signal intent to developers.
A `Ref<T>` returned by a function can be immediately identified as being reactive.

## Refactoring inheritance

The Brewblox UI made extensive use of class inheritance to implement code reuse.
These abstract base classes can introduce props, data, computed properties, and functions.
Some of them inherit from other abstract base classes.

This pattern works well to improve code reuse, but suffers from a lack of transparency.
Properties magically appear in the `this` namespace, with them being defined in any of the inherited classes.
Base classes may also inherit from each other, and then overwrite their parent's properties.
This only makes the transparency issues worse.

Base classes encourage putting all functionality together, to avoid further fragmentation.
For the rework, we used a much more modular approach to avoid God Objects.

This lead to functionality being moved to stateless utility functions,
composition functions, the new Provide / Inject feature, or it being removed entirely.

### Utility functions

Functions that depended on two or fewer local properties were moved to utility modules.
This commonly included functions that take a single object as input, have no output,
and modify the VueX store as side effect.

This includes functions like `startChangeBlockId(block: Block)`, `startRemoveWidget(widget: Widget)`,
and `startAddBlockToDisplay(block: Block)`.

Of all solutions, this one was the most straightforward, and thus preferable where possible.

### Composition

Composition functions can define props, emitted events, and setup functions.
For syntax, we took inspiration from [Quasar's useDialogPluginComponent](https://next.quasar.dev/vue-composables/use-dialog-plugin-component).

In contrast with base classes, composition functions can be kept small and modular.
Where multiple inheritance is a cause for concern, usage of multiple composition functions is both easy and safe.

To prevent the same transparency issues that plagued base classes,
composition-defined props and emits were kept to an absolute minimum.

This change in scope and functionality required the introduction of new design patterns, and changes to the ones used previously.
More on this below.

### Provide/Inject

Vue 3 introduces [Provide / Inject](https://v3.vuejs.org/guide/component-provide-inject.html)
as a way of sharing properties with all components in the tree below the provider.

We happen to have a textbook use case for tree-scope variables: widgets.
Any given widget component will have multiple descendants that need access to the `Widget` object.
This includes toolbars, generic action menus, and various `ExampleWidgetFull` / `ExampleWidgetBasic` components.

Previously, we solved this using [prop drilling](https://kentcdodds.com/blog/prop-drilling)
and [Crud components](./20190625_crud_component).

With the introduction of Provide / Inject, we can skip the drilled prop, and use an injected variable instead.
The composition function injects a provided ID, and uses it to fetch data from VueX and provide computed properties to the component.
By combining Provide / Inject and composition functions like this, we fully replicate the functionality offered by Crud components.

The immediate advantage of this approach is that it significantly reduced the number of boilerplate props floating around.

### Removed entirely

For some components, the abstraction of composition functions weren't worth the overhead they added.
Wizard components are the most prominent example of this.

All Quickstart task components are expected to emit `back`, `next` or `close`, depending on user input.
This parent component implements event handlers that react appropriately.

We could introduce a composition function that defined the required `emits`,
and returns `onBack()`, `onNext()`, and `onClose()` functions.
This abstracts no implementation details (the task still has to know when to signal back / next).
It requires implementing components to add `useWizard.emits` to their component definition, making the component less transparent.

A short spec of available props and listeners was added to src/plugins/quickstart/README.md instead.
Components may implement whatever subset they deem relevant.

## Composition and reactivity patterns

During development, more complicated use cases emerge.
This first results in a patchwork of ad-hoc solutions. During refactoring, reusable patterns are identified.

The new reactivity model has proven to be very helpful for making these patterns explicit.
Where the Vue 2 solutions were based on observed behavior of reactive objects,
Vue 3 lets us add or remove reactivity at will, and return objects that are explicitly reactive.

Below, we'll discuss three design patterns that we introduced during the rework.

### Bootstrap injection

A common pattern for composition functions is for them to consume one or more bootstrap variables,
and then return a number of computed and reactive properties that directly or indirectly depend on the bootstrap variable.
Functions without a reactive dependency on the bootstrap variable were typically moved to utility modules.

It can be considered good practice for composition functions to use the minimum amount of bootstrap variables.
If there are two independent variables, they can easily be used by independent composition functions.

As a case study, we'll look at the `useContext` composition function.
The parent component of a widget will provide a widget context.
This context is used to determine conditional rendering.

```ts
export interface WidgetContext {
  mode: 'Basic' | 'Full';
  container: 'Dashboard' | 'Dialog';
  size: 'Fixed' | 'Content';
}

export interface UseContextComponent {
  context: UnwrapRef<WidgetContext>;
  inDialog: ComputedRef<boolean>;
  toggleMode(): void;
}

// Using `InjectionKey` enables type checks for both provide and inject.
export const ContextKey: InjectionKey<UnwrapRef<WidgetContext>> = Symbol('$context');

export function useContext(): UseContextComponent {

  // We use the ! operator to pretend that the context is never undefined.
  // We'll manually check it below.
  const context = inject(ContextKey)!;

  // This check catches code-time bugs.
  // There is no scenario where the injected context is legitimately undefined.
  if (!context) {
    throw new Error('No widget context injected');
  }

  // A computed shortcut for a very common check.
  const inDialog = computed<boolean>(
    () => context.container === 'Dialog',
  );

  // Again, we add a convenience function for common boilerplate.
  function toggleMode(): void {
    context.mode = context.mode === 'Basic' ? 'Full' : 'Basic';
  }

  // The composition function returns the injected context,
  // and the provided computed prop and function.
  // The actual inject is abstracted away from calling components.
  return {
    context,
    inDialog,
    toggleMode,
  };
}
```

All components in the tree below the provider can now access `context`.
By updating `context.mode`, they can cause the widget to switch views.
As it is a reactive object, all components that use `useContext` will be notified of the change.

### Component-local caching

Widgets and blocks rendered in the UI can be updated by multiple sources.
In the case of blocks, the service publishes updates every few seconds.
Widgets are typically more stable, but changes made by one user are still synchronized to all other active clients.
This requires us to have a robust system for two-way data synchronization between VueX and individual components.

If other components and clients can modify widgets, they can also remove them.
Widget components must have a robust solution for their `Widget` suddenly becoming null.
This solution preferably does not involve `if (widget.value !== null)` checks in every single function and computed property.

By design, VueX requires us to send the entire configuration blob (eg. `Widget`, `Block`) when making a change.
Components typically don't have a reason to change the entire object - they just want to set a single nested value.
Writing the below statement correctly replaces the entire Ref, but is very cumbersome, and prone to subtle errors:

```ts
// YUCK
block.value = {
  ...block.value,
  data: {
    ...block.value.data,
    setting: {
      ...block.value.data.setting,
      value: block.value.data.setting.value + 5,
    },
  },
};
```

Setting a generic watcher that commits any and all changes is not a viable solution.
Not all changes only modify a single value.
Preferably we'd make one or more changes, and then explicitly commit them.

```ts
block.value.data.setting.value += 5;
block.value.data.enabled = true;
saveBlock();
```

A related issue is that the basic [state management pattern](https://vuex.vuejs.org/#what-is-a-state-management-pattern) from VueX
becomes jittery if no caching is done during the datastore roundtrip.
If you make a change, send it off to the datastore, and only render the change after the datastore confirms the change,
it noticeably degrades the user experience.
Values are set, revert to the previous value for a second, and then jump to the desired value again.

A solution that addresses all these concerns is to use a locally cached copy of the object fetched from VueX.
We can replace the value any time the store object changes.
At the same time, the component can incrementally change the cached value before explicitly committing the changes.
We render these local changes until the datastore / service roundtrip is complete,
and we replace our local copy with authorative new data from VueX.

If the VueX object is removed, we do not remove our local copy.
This avoids computed properties throwing errors when attempting to access nested values.
To get rid of the defunct component tree, an injected `invalidate` function is called.

As a case study, we'll use the `useWidget` composition function.

```ts
export interface UseWidgetComponent<WidgetT extends Widget> {
  widgetId: string;
  widget: Ref<UnwrapRef<WidgetT>>;
  saveWidget(widget?: WidgetT): Promise<void>;
  invalidate(): void;
}

export const WidgetIdKey: InjectionKey<string> = Symbol('$widgetId');
export const InvalidateKey: InjectionKey<() => void> = Symbol('$invalidate');

export function useWidget<WidgetT extends Widget>(): UseWidgetComponent<WidgetT> {
  // Both injected fields are mandatory.
  // Them not being set is a code-time bug.
  const widgetId = inject(WidgetIdKey);

  // All components that depend on the widget can invalidate the component tree.
  // The owning component is responsible for pulling the plug.
  const invalidate = inject(InvalidateKey);

  // We use the ! operator to pretend that `widget` is never null.
  // We'll manually check it below.
  const widget = ref<WidgetT>(widgetStore.widgetById<WidgetT>(widgetId)!);

  if (!widgetId) {
    throw new Error('No widget ID injected');
  }

  if (!invalidate) {
    throw new Error('No invalidation function injected');
  }

  // We need get a non-null value at least once.
  // It's a bug if the `widget` object is not present during setup.
  // This is quite separate from the scenario where `widget` later becomes null.
  if (!widget.value) {
    throw new Error(`No widget found for ID ${widgetId}`);
  }

  // Be flexible, and also accept full replacements for our widget.
  // Widgets include their own ID, so we can also use this function to save other widgets.
  async function saveWidget(w: WidgetT = widget.value): Promise<void> {
    await widgetStore.saveWidget(w);
  }

  // Replace `widget` whenever the store object changes to a new non-null value.
  // If the new object is null, we keep the last-known value,
  // and invalidate the component tree.
  watch(
    () => widgetStore.widgetById<WidgetT>(widgetId),
    (newV) => {
      if (newV) {
        widget.value = newV;
      }
      else {
        invalidate(); // This function was injected above.
      }
    },
  );

  return {
    widgetId,
    invalidate,
    widget,
    saveWidget,
  };
}
```

### Debounced computation

Builder widgets, pages, and editors all use asynchronously calculated Flow Parts.
Flow Parts are calculated with persistent part configuration as input,
but the calculation function is too slow for it to be done as part of a computed property.

The solution is to have a computed property for persistent parts,
and to place a watcher on this property that calls a debounced function to calculate the derived Flow Parts.

This pattern is built on top of component-local caching,
not because we expect regular external changes, but because we expect burst changes to `layout`.
Without a debounce, the race condition in datastore roundtrips would noticeably degrade UX.

This is the most variable of the patterns discussed.
Other implementations may have subtly different requirements for what must be cached, and what must be debounced.

```ts
export interface UseFlowPartsComponent {
  // The same local cache strategy as seen in component-local caching.
  // A difference is that now layout is nullable.
  layout: Ref<BuilderLayout | null>;

  // The same commit function as seen in component-local caching.
  saveLayout(): Awaitable<unknown>;

  // A property that can be computed directly based on layout.
  // If layout is null, we can safely return an empty list here.
  // This reduces the need for null checks in all downstream functions.
  parts: WritableComputedRef<PersistentPart[]>;

  // Flow Parts are computed asynchronously based on `parts`.
  // This composition function handles the implementation details,
  // and ensures that Flow Parts are kept in sync with parts.
  // Components should never directly modify `flowParts`.
  flowParts: Ref<FlowPart[]>;

  // A helper property, to facilitate downstream watchers.
  // `flowPartsRevision` is changed every time `flowParts` is recalculated.
  flowPartsRevision: Ref<string>;

  // Components may want to explicitly trigger a re-render.
  // For example, linked valves require a flow recalculation
  // if the MotorValve block changes state.
  calculateFlowParts(): Awaitable<unknown>;
}

export function useFlowParts(layoutId: Ref<string | null>): UseFlowPartsComponent {

  // The component-local cache variable.
  const layout = ref<BuilderLayout | null>(builderStore.layoutById(layoutId.value));

  // The debounced commit function for layout.
  // The actual function is called on the trailing edge to batch burst changes.
  const saveLayout = debounce(
    () => {
      if (layout.value) {
        builderStore.saveLayout(layout.value);
      }
    },
    500,
    { trailing: true },
  );

  // To support parts being removed,
  // the entire array should be provided for every update.
  const parts = computed<PersistentPart[]>({
    get: () => vivifyParts(layout.value?.parts),
    set: values => {
      if (layout.value) {
        layout.value.parts = values.map(asPersistentPart);
        saveLayout();
      }
    },
  });

  const _flowParts = ref<FlowPart[]>([]);
  const flowPartsRevision = ref<string>('');

  // We link `flowParts` and `flowPartsRevision` by using a computed property.
  // The actual data is stored in `_flowParts`.
  const flowParts = computed<FlowPart[]>({
    get: () => _flowParts.value,
    set: values => {
      _flowParts.value = values;
      flowPartsRevision.value = nanoid(6);
    },
  });

  const calculateFlowParts = debounce(
    () => {
      // We intentionally make a non-reactive copy here.
      // The result will again become reactive when assigned to `flowParts`.
      const source = deepCopy(parts.value);

      // The magic happens here.
      // calculateNormalizedFlow() does the actual calculation.
      flowParts.value = calculateNormalizedFlows(source.map(asStatePart));
    },

    // 500ms is a ballpark guess that may require later tuning.
    // We'd prefer to use an adaptive value based on actual performance,
    // but this is not supported by the lodash debounce function.
    500,

    // Here, we want single changes to trigger immediately,
    // with the delay only kicking in for followups.
    // Remember that `parts` is changed atomically.
    // Multiple parts changing simultaneously is treated as a single change.
    { leading: true },
  );

  // Watch for external changes to the layout.
  // This includes confirmation of our saves, but also changes made by parallel users.
  watch(
    () => builderStore.layoutById(layoutId.value),
    newV => layout.value = newV,
  );

  // If parts change, sync flow parts.
  watch(
    () => parts.value,
    () => calculateFlowParts(),
    { immediate: true },
  );

  return {
    layout,
    saveLayout,
    parts,
    flowParts,
    flowPartsRevision,
    calculateFlowParts,
  };
}
```
