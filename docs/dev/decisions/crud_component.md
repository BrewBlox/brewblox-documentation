# CrudComponent data management

Date: 2019/06/25

## Context

State management in the UI is typically handled by three mechanisms: [reactivity](https://vuejs.org/v2/guide/reactivity.html), [events](https://vuejs.org/v2/guide/events.html), and [VueX](https://vuex.vuejs.org/guide/).

Parent components pass directly relevant props to child components, child components update data by emitting events, and everyone can query the VueX store for centrally held data.

We have two core interfaces used throughout the UI: widgets (dashboard items), and blocks.
Many components are aware they're directly acting on one or both of these.
<br> As even some deeply nested components can update widgets or blocks, the natural thing is to let them dispatch a VueX action, and VueX updates (commits) the reactive object used by everyone else.

This approach breaks down when we start using volatile widgets or blocks. This happens in the following scenarios:
- The Spark Service page generates a local widget for each block reported by the controller.
- Wizards generate a local widget and/or block to allow configuration before creation.
- Block form dialogs generate a local widget to allow re-using the form to edit an arbitrary block.

In these scenarios we can't use the VueX store to read or update an item that's not in there.

Passing all data up and down as properties and events would create a lot of unneccessary traffic through components that don't directly make use of the data they're passing up and down.

## CrudComponent.ts / BlockCrudComponent.ts

A solution is to combine the approaches. A top-level component creates an object with data and callbacks (`Crud` / `BlockCrud`) which is injected into child components.

```typescript
export interface Crud {
  widget: DashboardItem;
  isStoreWidget: boolean;
  saveWidget: (widget: DashboardItem) => unknown | Promise<unknown>;
}

export interface BlockCrud extends Crud {
  block: Block;
  isStoreBlock: boolean;
  saveBlock: (block: Block) => unknown | Promise<unknown>;
}
```

The child components inherit from either `CrudComponent` or `BlockCrudComponent` - a component that knows how to use the `Crud` / `BlockCrud` object.

`BlockCrud` is an extension of `Crud`: it can also be used by a direct descendant of `CrudComponent`

<PlantUml src="crud_component.puml" title="A component tree using Crud objects"/>

The above diagram is a practical example of components relate. 
- `PidWidget` is the dashboard item.
- `PidForm` is the main block dialog that allows editing the Pid widget and Block.
- Both the widget and the form have a toolbar with actions.
- The widget actions include `RenameWidgetAction`
- The block actions include `RenameBlockAction`

The components in cyan are the ones responsible for creating the `BlockCrud` object. All child components further down inherit CrudComponent, which defines the `crud` property.

The resulting prop passing is straightforward:

```vue
...
<PidForm :crud="crud"/>
```
```vue
...
<BlockFormToolbar :crud="crud"/>
```
```vue
...
<WidgetActions :crud="crud"/>
```
```vue
...
<RenameWidgetActions :crud="crud"/>
```

In our example, when we click on the "rename widget" action, the following things happen:
- `RenameWidgetAction` calls `super.renameWidget()`.
- `CrudComponent` starts the block renaming dialog.
- When the dialog is done, `CrudComponent` calls `this.crud.saveWidget(renamedWidget)`
- Here the call tree forks, based on who originally created the `Crud` object.
  - `showBlockDialog` defines `saveWidget` as:
  ```typescript
  saveWidget: (widget: DashboardItem) => { localWidget = widget; },
  ```
  - `PidWidget` defines `saveWidget` as:
  ```typescript
  saveWidget: (widget: DashboardItem) => this.$emit('update:widget', widget),
  ```
    - What will happen to the emitted widget is up to the Dashboard or Service page.

The end result is that the save widget call was immediately handled by the correct function, without `RenameWidgetAction` having to be aware of what would happen.

All classes sharing a parent also nicely centralizes all code that updates Widgets or blocks.
