# Dynamic Widgets

Date: 2019/10/04

## Context

Quasar 1.0 made it possible to create custom dialogs in JS. Since then, we've gradually introduced more and more elements that spawn a (block) dialog.

Some examples:

- Wizards
- Builder parts linked to blocks
- Block relations diagram
- Input/Output blocks in PID, PWM
- Indicators shown when a block is driven

Easy access to dialogs allowed us to move towards a design philosophy where less is shown initially, but all relevant data is easily reachable through clickable elements that spawn a dialog.

This approach revealed some shortcomings in feature architecture.

## Problem: simple vs advanced

Features implement two components: a widget, and a form. The widget is shown on a dashboard, the form is shown in dialogs.
Widgets are meant for day-to-day use, forms are for setup and configuration.

This becomes problematic when the Brewery Builder is used as a day-to-day UI. The Builder has multiple parts that show one or two important values from a block, and spawn a dialog when clicked.

This creates the use case where the dialog is used for day-to-day interaction, but it shows the form.

The ideal situation is one where both the simple (Widget) and advanced (Form) component are easily accessible through a dialog.

## Problem: generic dialogs

Widgets are considered the interfacing component between the fully generic Dashboard, and whatever specific functionality a feature wants to implement.

Forms have more freedom of implementation - at time of design, the widget was the only expected caller.

The proliferation of dialogs led to the standardization of block forms ([crud component design](./20190625_crud_component.md)), to the point where they could be created by a generic function.

If we want to show non-block features in dialogs, they must implement a common interface.

## Problem: context-specific rendering

Widgets and forms are responsible for how they are rendered, but there are context-specific requirements.

A notable example is the toolbar: widgets and forms use a different toolbar, and the form toolbar must have a close button.

It is also not unlikely that a widget has no need for both a simple and an advanced component - it may not have enough settings to qualify as "advanced".

## Requirements

- Features can implement a simple and an advanced component.
- All features must be accessible through a generic dialog.
- Within the simple dialog, the advanced version must be easily accessible, and vice versa.

## Solution

To minimize the interface, it is best if there is one standardized component, valid both as dashboard item, and as dialog.

As widgets are responsible for their rendering, it is best to use properties to describe the context. This can be done using two properties:

```ts
type WidgetMode = 'Basic' | 'Full';
type WidgetContainer = 'Dashboard' | 'Dialog';
```

Widgets are expected to initially use the mode they are passed as property, but are free to implement a toggle function.

To summarize:

- Widgets are used in both dashboards and dialogs.
- Widgets are passed properties describing the context.
- Widgets are expected (but not forced) to support Basic and Full render modes.
