# Brewblox Spark simulation

The Spark service comes with a built-in simulator.
This simulator won't control physical actuators or use OneWire sensors, but also doesn't need a Spark controller to function.

Setting it up is easy.

Navigate to the directory you chose during the installation (default: `cd ~/brewblox`), and run this command in your terminal:

```bash
brewblox-ctl add-spark --simulation
```

## Converting a service

Blocks and block names defined by a simulation service will not be used by a non-simulation service.

If you originally set up the system with a *spark-one* simulation service, you can convert it to a non-simulation service by running the following command:

```bash
brewblox-ctl add-spark --name spark-one
```

The simulation blocks will be kept, but not used by the Spark controller.
