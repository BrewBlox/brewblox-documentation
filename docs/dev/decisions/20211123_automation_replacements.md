# Automation service replacements

Date: 2021/11/23

## Features

With the automation service declared a dead end, the use cases it was scheduled to implement haven't gone away.
Where possible, we want to build these features anyway.

Automation use cases can be divided into four broad groups:

- Load parameters from recipe.
- (Semi-)automatically transition between predefined steps.
- Notify user if a condition is met.
- Accept input from third-party devices (sensors or buttons).

From a technical perspective, this requires at a minimum:

- Standardized definitions for steps, parameters, and configuration changes.
- Daemon-like condition checks (both event listeners and polling) that trigger predefined functions.
- Integration with various external tools to notify end users (push notifications, emails, API calls, etc.)
- Standardized APIs for third-party devices.
- UI elements to configure all of the above.

To build all this, the most significant work items are:

- Defining data formats for steps, parameters, and configuration changes that is both flexible and maintainable.
- Defining abstraction levels and user-facing interfaces for the underlying configuration.
- Building editor UIs for all parameters + CRUD of configuration at all levels.
- Building backend functionality to watch conditions, execute predefined steps, and run triggered functions.

Surprisingly, the last category is by far the smallest. Building and refining UI components until they are both powerful and user-friendly is the biggest time sink, both in terms of upfront work until a MVP is available, and later iterations to refine and improve user experience.

## Automation history

The automation service went through multiple phases before it was definitively cancelled:

- Step-based processes: *Do X until condition Y is reached, then go to next step*
- Integration with feature requests: simple triggers, user notifications, and buttons.
- DIY before implementation: addition of a scripting sandbox.
- Move to generic model: evaluation of alternatives and cancellation.

**Step-based processes**

Initially, automation was seen as a way to build brewery process control, with semi-linear processes that consist of consecutive steps.
In software terms, this can be best expressed as a Finite State Machine (FSM) where actions are applied during state transitions.

A process consisted of multiple steps, and each step consisted of three phases:

- Preconditions
- Actions
- Transitions

The state machine would check step preconditions in a loop until they were satisfied, then apply actions, and then check transition conditions in a loop until one of those was satisfied.
A property of every transition would be the "next" step. If the transition conditions were satisfied, the state machine would load the next step.

There were two problems with this approach. It was very clunky to set up or configure, even for its intended purpose, and users often were looking for a much more streamlined If This Then That style of automation.

**Feature requests**

The most common feature requests involved the addition of If This Then That style triggers, and support for various flavors of user notification, including, but not limited to: Slack, Discord, Telegram, e-mail, SMS, and Pushover.

Other requests weren notable in their diversity. The automation service in theory was a natural fit for custom behavior, but in implementation required us to explicitly support many of these custom features.
This was not something we could realistically do.

Observations from interactions with users yielded the conclusion that "editing block settings" was an abstraction level too detailed for comfortable use.
This compounded the known problem that the block API is multi-client. Clients can't guarantee that if they recently updated block settings, the settings are still set that way.

**Scripting sandbox**

As a compromise solution for custom functionality, a JavaScript sandbox was implemented.
Process actions could now be defined as JavaScript functions, giving users more leeway to build custom features.
If any given function was popular enough, we could always add explicit support.

This was very useful for the subset of users that felt comfortable writing JavaScript. For others, not so much.

**Re-evaluation and cancellation**

The addition of a general-purpose sandbox signalled a wider shift in the design philosophy behind the automation service.
It started out as a specific implementation of a linear FSM, and was now shifting to be a generic low-code platform that happened to have good support for Brewblox APIs.

We could either provide a very basic and low-level low-code platform, or manually build UI elements for a large array of Brewblox-related conditions and actions.

The first option would be a direct alternative to existing low-code platforms, and the second involved a staggering amount of work (ballpark: 2 years FTE).

Providing a low-code platform is not our core business. The conclusion was that we'd either muddle on for years more before something useful emerged, or we'd cancel the whole thing, and concentrate our efforts on the core software.
Unsurprisingly, we decided to stop all implementation efforts for the automation service.

## Alternative implementations

The cancellation of the automation service leaves us with a set of (planned) features that need to be rehomed.

## Replacements: Node-RED

For custom user features by and for power users, Node-RED is the recommended low-code platform.
We built some low level integrations to facilitate this, but this is an approach with a very high barrier to entry.

## Replacements: Quick Actions

The UI already has very basic macro-like functionality in the shape of Quick Actions.
We can't implement any reliable UI-side triggers, but we can extend Quick Actions to provide reasonably generic support for applying predefined actions.

## Replacements: Setpoint Stepper block

A specific feature request for Mash support is the *Setpoint Stepper* block (working name).
This block is an alternative to the *Setpoint Profile*, but with the distinction that it can wait until the target temperature is reached before it moves to the next step.

A basic implementation would look like a list of actions, with every action being either:

- Set setpoint setting
- Wait until setpoint setting is reached
- Wait for X seconds/minutes/hours

This feature is straightforward enough that it is a good fit for implementation in firmware.

## Replacements: Integration with recipe software

For any recipe integration to be feasible, two preconditions must be met:

- There is an interface at a workable abstraction level (matching the recipe definition) to avoid overly fragile configuration.
- Predefined configuration must support variables and derived variables to allow for configuration re-use.

If we want to support recipe integration, then we also need to pick what software or configuration format(s) we'll be compatible with.

For advanced automation, we still need a backend service, but for a significant subset of desired functionality (mashing and fermentation), The *Setpoint Profile* and *Setpoint Stepper* blocks suffice.
