# Handling volatile widgets

Date: 2021/05/02

## Context

Not all `Widget` and `Block` objects should be stored in the datastore.
Wizards want to let the user modify a widget before it is created.
Block dialogs and the Spark service page generate widgets on the fly to help render block widget components.

This complicates the data flow for widget components.
We don't want an if statement to guard every single `saveWidget()` call.
We need a centralized arbiter above component level that decides how and where volatile widgets and blocks are saved.

Previously, this was handled by injecting a save function as part of the [Crud](./20190625_crud_component.md) object.
As part of the Vue 3 rework, we are dropping Crud components in favor of a solution that uses Provide / Inject.

This requires us to re-evaluate our strategy for mixing persistent and volatile widgets.

## Scenarios

There are quite a few reasons for rendering a widget component.

| Parent                    | Widget?    | Block?                 |
| ------------------------- | ---------- | ---------------------- |
| Dashboard widget          | Persistent |                        |
| Dashboard block widget    | Persistent | Persistent             |
| Service page block widget | Volatile   | Persistent             |
| Dialog widget             | Persistent |                        |
| Dialog block              | Volatile   | Persistent             |
| Dialog block widget       | Persistent | Persistent             |
| Wizard widget             | Volatile   |                        |
| Wizard block              | Volatile   | Volatile               |
| Wizard block widget       | Volatile   | Persistent or volatile |

The widget will never be undefined, but otherwise we can assume that we need to account for every possible combination.

## Centralization

VueX is the natural place to store data that is used by multiple semi-independent components.
We can split the flows here, but if persistent and volatile objects share the same API,
we need some kind of flag to tell them apart.

For widgets, this is easy. We add a `volatile?: true` field to the `Widget` interface.

For blocks, this requires a compromise somewhere.
Block types are shared between repositories. Adding a UI-only `volatile` flag would poison the type for all other consumers of the type.
After some discussion, we settled on adding a `meta?: AnyDict` field to handle use-at-own-risk metadata.

Now, during the `saveWidget(widget: Widget)` / `saveBlock(block: Block)` functions, we can split the data streams.
Persistent objects are sent to the datastore / the spark service,
and volatile objects are immediately stored in an array in the VueX module.

## Create / Remove / Update / Delete

This separation of data flows introduces some conditional behavior to the VueX module APIs.
Some ground rules can be defined to avoid unexpected behavior.

- `save()` and `getById()` functions should be compatible with both persistent and volatile objects.
- `create()` and `remove()` only accept persistent objects.
- `setVolatile()` and `removeVolatile()` only accept volatile objects.

For UX reasons, widget components should not offer to create or remove volatile widgets anyway.
They only require `save()` and `getById()` functionality to be functional for all objects.

Parent components are expected to manage the persistent/volatile state of the object,
and benefit from a more explicit separation in the API.

## Lifecycle of volatile objects

For most volatile objects, their lifecycle is directly tied to that of its parent component.
For example, a block dialog creates a volatile widget during setup, and removes it again when the dialog is closed.

For others, the issue is somewhat more complicated.
The Spark service page generates volatile widgets for all blocks present on the controller.
Because graph configuration is stored in the block widget `config` field,
we'd rather not remove all volatile widgets the moment the user navigates away from the spark service page.

A solution that is acceptable in the short term is to generate the volatile widgets with predictable IDs,
and not remove them at all.
The list of volatile widgets will be cleared on page load,
and remains stable unless the user removes and recreates all blocks with different names.

This is technically a memory leak, but one that will not grow if no blocks are removed.
