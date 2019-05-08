# BrewBlox Control Chains

When first installing BrewBlox, it can be a bit overwhelming.
We designed BrewBlox to be very flexible and modular to give you a lot of freedom (and responsibility) to adapt it to your brewery.
The downside of this flexibility is that it there are a lot of parts that you can combine and should understand.

This page describes some common ways on how blocks can be combined to create control chains.
We will add wizards to the UI to create the most common arrangements, but still it helps to understand their design.

## A basic example

<PlantUml src="basic_chain.puml" title="Basic Control Chain"/>

The minimal building blocks for a control system are:

- A sensor, to measure what you want to control.
- A setpoint, the target value for the sensor.
- An actuator, to drive the sensor value towards the setpoint
- A controller, in our case a *PID*, to calculate what the value for the actuator should be from the sensor and setpoint value.

In BrewBlox, the input of a PID is a *setpoint-sensor pair*. This block contains the target value (setpoint) and a link to the sensor.

The *PID* calculates the error, the difference between setpoint and sensor, and keeps a history of to calculates an output value.
The details of the PID will be described in a different article. [Wikipedia](https://en.wikipedia.org/wiki/PID_controller) also gives a good overview.

The actuator, a heater or cooler, can in most cases only be turned fully ON or fully OFF with a digital output pin.
But the PID calculation generates a numeric value, like 20 or 56. This is solved with a PWM block between the PID and the digital pin.

PWM stands for [Pulse Width Modulation](https://en.wikipedia.org/wiki/Pulse-width_modulation). The PWM block has a configurable time period of for example 4 seconds.
It will turn ON the actuator for a part of that 4 second period and off for the remaining time.
A PWM value of 40% will turn ON for 1.6 seconds and OFF for 2.4 seconds and repeat.
This turns the digital ON/OFF actuator into an 'analog' numeric actuator with a range between 0% and 100%.

## Heating and cooling a Fridge

<PlantUml src="fridge_chain.puml" title="Fridge Control Chain"/>

As a second example, we'll look at controlling fridge temperature.
You can cool the air in the fridge by turning the fridge compressor on.
To be able to also raise the fridge temperature, you can install a heater inside the fridge.

Because the system responds differently to the heater and cooler, they will each get their own PID and PWM block.
They can both use the same sensor-setpoint pair as input.

The cooling PID will have an opposite sign compared to the heating PID, so they generally do not overlap.
If the system needs heating, the output of the heating PID will be positive and the output of the cooling PID wil be negative.
The heating PWM will start pulsing and the cooling PWM will remain off.

#### The mutex block

To prevent simultaneous simultaneous cooling and heating, we add a constraint to the actuaor pins.
The Actuator Pins are linked to a Mutex (**mut**ually **ex**clusive) Block. When one of them already holds the Mutex, the other one cannot turn on.
This ensures only one will ever be active at the same time.
The Mutex block has an additional wait time setting: when the heater has been ON, the cooler has to wait at least 30 minutes. This prevents quickly alternating.

#### Minimum ON and OFF time to protect the compressor

For heaters, it is fine to turn it on and off every 10 seconds.
But a fridge compressor can be damaged by short bursts of power. It needs some time to cool down after it has has run.

So for the fridge we choose a PWM period of 30 minutes and configure a minimum OFF time of 5 minutes on the output pin.


## Beer Control

<PlantUml src="offset_chain.puml" title="Beer Control Chain"/>

The Fridge Control chain ensures a constant temperature inside the fridge. For a more consistent temperature of the beer inside your fridge, you may want to extend your control chain.

All other Blocks function the same, but now we will be automatically adjusting the Fridge Setpoint setting.

The beer PID drives the Fridge Offset Actuator, and the Fridge Offset Actuator translates the output setting dictated by the PID to an adjustment of the Fridge Setpoint setting.

## OneWire Actuators (DS2413)

<PlantUml src="onewire_chain.puml" title="OneWire Control Chain"/>

If you want to use a DS2413 Actuator instead of an Actuator Pin, this requires a subtly different setup. The DS2413 Chip will be automatically discovered, but you need to create an Actuator to use one of the channels as the Chip for output.

Everything else in the control chain remains the same.

## Setpoint Profiles

<PlantUml src="profile_chain.puml" title="Profile Control Chain"/>

By default, a Setpoint Sensor Pair has a constant setting. If you want to automatically adjust the temperature over time, you can add a Setpoint Profile Block.

A Setpoint Profile will change the Setpoint setting at a specific time. For example, you could create a profile that will repeatedly cold crash your beer, or one that slowly heats it by increasing the Setpoint setting by 1 degree per hour.

Once again, everything else in the control chain remains the same: the PID will automatically adjust to the changed Setpoint setting.

## Balanced Actuators

<PlantUml src="balanced_chain.puml" title="Balanced Control Chain"/>

It is not uncommon to have electrical elements where the combined power draw is more than the fuses can handle. The Balancer Block constrains actuators to divide the available power (output setting) as fairly as possible.

This functionality is not directly relevant to the standard Fridge setup, as there the heater and cooler should not be active at the same time, but is intended for systems with (for example) multiple heating elements in different kettles.

A Mutex Block solves the problem of heating elements being active at the same time, but also causes a new issue: resource hogging. If the left PWM Actuator has an output setting of 100%, it may prevent the right heating element from ever turning on.

The Balancer Block fairly distributes available output (100%) over the two actuators, and takes their requested output into account. If the left PWM actuator requests 100%, and the right PWM actuator requests 60%, the Balancer may grant 65% to the left and 35% to the right (example numbers).

When combined, the Mutex makes sure the heating elements are never drawing power at the same time, and the Balancer makes sure that both PWM cycles leave room for the other.
