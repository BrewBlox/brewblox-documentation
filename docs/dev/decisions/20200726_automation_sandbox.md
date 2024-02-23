# Automation Scripting Sandbox

Date: 2020/07/26

## Context

After releasing the initial implementation for the automation service,
we evaluated feedback, requested features, and lessons learned during implementation.

We're happy with the overall model of using Preconditions -> Actions -> Transitions.
The flow is flexible enough to cover branching processes, and simple enough to explain.

More problematic are the complexity and UI elements required to implement non-trivial Conditions.
This already comes evident for relatively simple use cases such as
`if measured temperature is more than 10 degrees Celsius lower than desired temperature`.

Our problem is not unique. The automation service is a simple example of [no-code](https://hackernoon.com/10-low-code-and-no-code-application-development-platforms-ew513y8q) software development.
No-code platforms by their nature sacrifice power for ease of use.
A GUI is always less expressive than a CLI, but has much better discoverability.

The automation service is a useful extension of core functionality, but is not our most important software.
Implemented features have to be cost-effective in terms of required effort to implement and maintain.

Going all-in on a 100% GUI-based solution does not seem to be worth it.
Some intermediate solution that can be improved incrementally has to be found.

## Expressing complexity

Code is the best way to give a computer detailed instructions.
What requires a dozen elements in a GUI can be expressed in a single line of code.

The user-defined complexity in automation processes is highly localized in Conditions and Actions.
A promising approach with a lot of precedent is to embed sandboxed user scripts.

This would reduce the before-mentioned expression to:

```txt
sensorBlock.data.value < setpointBlock.data.setting + 10
```

Sandboxed Conditions and Actions can co-exist with their UI-based peers.
Giving all UI Conditions/Actions a sandbox counterpart is simple,
and we can gradually add more UI versions of common and popular use cases.

## Discoverability

With Brewblox, we have some experience with how to reduce complexity without sacrificing configurability.
One useful approach is to use a wizard that asks some questions, and then generates code.

Users can easily see what's possible, get an example of working syntax,
and are then free to modify and combine as they see fit.

## Language

For a sandbox, the use of an interpreted scripting language is all but a given.
Scripting languages tend to be easier to get started with, and don't require a separate compilation step.

The top three choices are:

- **Python**
  - Popular
  - Easy and intuitive syntax
  - Requires a large runtime
  - Slow to initialize
- **JavaScript**
  - Popular
  - Same runtime as the automation service itself
  - Has some questionable core language behavior (`==`, `10 + 'string'` vs `'string' + 10`)
- **Lua**
  - Extremely light-weight
  - Designed to be an embeddable scripting language
  - Relatively unknown
  - Scales badly

Of these three, Python is the least attractive due to its large runtime and slow startup.
While Lua is attractive, JavaScript has a much larger developer community and set of available libraries.

Decision: **JavaScript**.

## Changes

- Implement a sandboxed JS runtime in the Automation service.
- Add Sandboxed options for both Conditions and Actions.
- In the UI, implement wizards to generate (example) scripts to get users started.
