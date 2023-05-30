# Tilt service state

The Tilt service periodically publishes [state events](./state_events.md).
This document serves as reference for the topic and payload schemas used.

All referenced code snippets use the [TypeScript interface syntax](https://www.typescriptlang.org/docs/handbook/interfaces.html).

## Event types

The Tilt service periodically wakes up, and publishes two kinds of state:

- A basic confirmation that the service is active.
- Per-device events that contain measured data.

## Service State

This event is always published.
If no data was received from Tilt devices, this will be the only published event.

```ts
export interface TiltServiceStateEvent {
  key: string; // Service ID
  type: 'Tilt.state.service';
  timestamp: number; // ms date
}
```

## Tilt State

This event is published for each device, if data was received at least once since the previous state push.

The temperature, SG, and plato fields contain calibrated data if calibration values were provided, and uncalibrated data otherwise.

If no calibration values were provided, their `uncalibrated` counterparts are undefined.

```ts
export interface TiltStateEvent {
  key: string; // Service ID
  type: 'Tilt.state';
  timestamp: number; // ms date
  color: string;
  mac: string;
  name: string;
  data: {
    'temperature[degF]': number;
    'temperature[degC]': number;
    specificGravity: number;
    'rssi[dBm]': number;
    'plato[degP]': number;

    // Present if calibration values are provided
    'uncalibratedTemperature[degF]'?: number;
    'uncalibratedTemperature[degC]'?: number;
    uncalibratedSpecificGravity?: number;
    'uncalibratedPlato[degP]'?: number;
  };
}
```
