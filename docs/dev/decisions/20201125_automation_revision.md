# Automation revision and Node-RED

Date: 2020/11/25

## Context

The automation service has been a long-term project for [little over a year now](./20191118_automation_service.md).
We haven't been exclusively working on it, and much of our time has been spent on feature and architecture design.
There clearly is demand for functionality like it, but there are also serious concerns that must be addressed.

## User feedback

When getting feedback from Brewblox users, some responses were common:

- "I just need a fermentation setup"
- "I want notifications"
- "I want external buttons"
- "I want to import recipes"

Complexity of configuration also was a concern, but that is a constant throughout Brewblox.

The newly introduced scripts are seeing some use, but a significant number of interviewed users preferred the graphical editor.

## Scope

The automation service is a useful, but not the most important feature of Brewblox as a system.
Our top priorities are to build a system around the Spark controller,
and to offer a generic platform for integration with third-party devices.

Practically speaking, that means we work on the automation service if we don't have anything more important to do.
This limits the desired scope of automation-related features.

It's become clear that a lot more work needs to be done before the automation service would be capable of importing recipes,
and applying them to user-defined configurations.

## State Machines

[Originally](./20191118_automation_service.md) we envisioned the automation service as a Finite State Machine, and designed accordingly.
This makes sense for a full-fledged brew setup, but is overly complicated for the "send me a message if temp > X" use case.

If we strip away the state machine assumptions, we end up with a generic computation model.
This model can still be used to implement a state machine, but is not limited to doing so.

## New direction

Code-based solutions are already supported in the shape of services,
and users liked the graphical editor.
We'll want to stick with that for automation v2.

There are quite a lot of [Visual Programming Languages](https://en.wikipedia.org/wiki/Visual_programming_language).

Apart from the conclusion that the automation service needs a major overhaul or replacement, requirements are still fluid.
Some of them are unlikely to change, and can be used to create a shortlist of interesting platforms.

- Free and open source.
- Compatible with a Docker-based runtime.
- Compatible with a Raspberry Pi platform.
- Multiplatform editor: either browser-based, or compatible with Linux/Windows/Mac.
- Easy access to event handlers: common feature requests (buttons, notifications) are all event-driven, and the Spark service actively pushes updates.
- Offers tooling and API's to create predefined functions for Brewblox systems.
- Compatible with JSON data over REST/MQTT.

## Next steps

[Node-RED](https://nodered.org/) is a low/no code platform that meets all our criteria,
and is explicitly designed to be useful in the IoT space.
This makes it a good candidate for a proof of concept implementation.

We can use that implementation to define and adjust our requirements.
