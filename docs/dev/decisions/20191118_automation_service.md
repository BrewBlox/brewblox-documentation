# Next steps: Automation Service

Date: 2019/11/18

## Context

Right now, the core functionality of Brewblox as fermentation control system is mostly complete. Users can:

- Keep brews at a desired temperature - or temperature profile
- Manually control secondary actuators (valves)
- View process data in graphs
- Render and control their system using a simplified model (Builder)

The ambition is for Brewblox to be more than a fermentation control system, so it was time to identify the Next Big Thing.

Any brew day follows a mostly predetermined set of steps - some manual, some that can be automated. If we want it to be able of managing the entire brewing process, it must be able to manage processes that require significant changes to settings throughout the process.

The best interaction model for end users is when they have "start" button at the beginning of their brew day, and then occasionally press "next" when they completed a manual step (eg. adding grains).

For this to happen, the system has to support much more complex actions and logical triggers than those currently available in the firmware (Constraints / Setpoint Profile).

## Implementation layer

It's a given what regardless of where we implement the automation daemon, the UI will be very much involved - processes will be user-defined, and users would rather not be editing JSON files.

There are two big concerns when setting up any kind of automated functionality: persistence, and reliability. We want to run the code somewhere where it can keep running for days or months at a time. We want the process to reliably handle automated triggers, without any user intervention or oversight.

Any network hops between the automation process and the controller significantly reduces reliability.

For these reasons, we'd prefer to make the Spark controller responsible. It'd reduce the impact of any network outages, and the automation update loop is nothing more than the block update loop on a bigger scale.

Sadly, this is not feasible.

The configuration involves too much data for the Spark controller to store - the few kB of EEPROM available simply aren't enough to store user-defined strings longer than a few characters. We'd also want to support multi-controller processes almost immediately.

An UI-based implementation is attractive for keeping the required configuration contained in a single layer. The problem here is that a web UI is unable to run any serious background tasks: everything is terminated when the user closes the browser.

That leaves us with the service layer.

The functionality clearly falls outside the scope of what the `brewblox-devcon-spark` service does, and there are no alternative candiates for integrating the feature in an existing service. It will have to be a new service.

## State Machine

In terms of software architecture, an automation service is nothing more than a user-defined state machine.

To keep things simple, we'll keep the number of configurable fields in each step to a minimum. Steps have:

- Actions (automatically performed on entry)
- Conditions (must evaluate True in order to leave the step)
- Notes (user-defined text fields)

Processes are kept strictly linear, without any conditional branching.

## Defining Todo items

The majority of brewers using Brewblox will still use a process that involves manual tasks - be it adding ingredients, re-routing tubing, opening valves, or simple verification that everything is as it should be.

We can support this in our automated state machine by generating and checking Todo items. **Actions** may generate an item, and **conditions** may check whether the user has marked the item as "done".

## Conclusions

The Next Big Thing for Brewblox is an automation service to fully manage brew days.
This automation service is implemented as a backend service, using a straightforward linear state machine.

Manual tasks are explicitly supported: the user is responsible for marking them as completed.

## Further work

As with other features, software design, UI design, and implementation are developed using an iterative approach. Further documentation on software/UI design is forthcoming.

Significant effort will have to be made to clearly communicate to users that actions are executed on entry, and conditions are checked before exit.
