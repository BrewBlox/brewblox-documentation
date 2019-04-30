# BrewBlox Control Chains

When first installing BrewBlox, it can be a bit overwhelming. The disadvantage of a modular system is that there are a lot of moving parts that must be understood in order to use them.

This guide describes some of the most common combinations, and how they are used in the Classic BrewPi arrangement.

## Basics

<PlantUml src="basic_chain.puml" title="Basic Control Chain"/>

This basic control loop has five Blocks, each with a distinct responsibility:
- *Temperature Sensor* measures the current temperature.
- *Setpoint Sensor Pair* combines the measured temperature with the desired value (Setpoint setting).
- *PID* uses the Setpoint setting and Sensor value to calculate the required output.
  - For an explanation on how PID controllers work, see [wikipedia](https://en.wikipedia.org/wiki/PID_controller).
- *PWM Actuator* converts the % output value from the PID into a sequence of on/off periods.
  - [explanation of pulse-width modulation (PWM)](https://en.wikipedia.org/wiki/Pulse-width_modulation).
- *Actuator Pin* toggles the heating or cooling element.

## Fridge Control

<PlantUml src="fridge_chain.puml" title="Fridge Control Chain"/>

We'll refer to your controlled environment as the "Fridge". The assumption is that you keep your beer in a separate container inside your Fridge.

The drawback of the basic control chain is that it can only ever influence the system in one direction. Actuator Pins only have an on/off switch.

If you require both heating and cooling, you'll need a separate PID for each action. They can both use the same sensor value and setpoint setting. If the sensor value is lower than the setpoint setting, the heating PID will correct this. If the sensor value is higher than the setpoint setting, the cooling PID will become active.

To avoid simultaneous cooling and heating, the two Actuator Pins are linked to a Mutex Block. This ensures only one will ever be active at the same time.

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
