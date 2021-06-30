# This is the new Brewblox Spark 4

We are proud to finally announce the next generation of our brewery controller: the Brewblox Spark 4.

This upgrade is a much bigger change than the Spark 2 to Spark 3: we are taking hardware flexibility to the next level.
You can see the new Spark 4 below, with the first I/O module that will be available.

<p align="center">
<video width="540" autoplay loop>
<source src="/images/spark4/rotating-spark4.webm">
</video>

<Gallery
:images="['/images/spark4/spark4-01.jpg','/images/spark4/spark4-02.jpg','/images/spark4/spark4-03.jpg','/images/spark4/spark4-04.jpg']"
thumb-size="150px"
/>
</Gallery>
</p>


## Designed for flexibility
So what are these new I/O modules?

For the Spark 4, we decided to take a new approach to hardware modularity.
On the Spark 3, additional sensor and actuator boards were connected with cables and communicated with using the 1-Wire protocol.
We also had RS-485 pins on the RJ12 connectors, but never released an expansion board that used them.

### The downsides of 1-wire
The 1-Wire protocol is great for its simplicity and costs, but it comes with some major downsides:

- All devices share a single bus. If one of them fails, it can take down all other devices.
- Long cables can cause communication errors.
- The connected devices do not have a fail-safe mechanism. A 1-Wire actuator will remember its last state. If it loses connection with the main processor, it will just be stuck at the last state it was set to.

To make connected devices smarter, for example to turn everything off when the connection is lost, it would need to run custom firmware.
That means it would need its own microcontroller and firmware, and communicate over RS-485 with the main processor.
This greatly increases the cost and complexity of expansion boards, both in hardware and software.

### A new approach: stackable I/O modules
The Spark 4 uses a new approach for connecting sensors and actuators: they can be plugged directly into the main processor.
On the bottom of the Spark 4, there is a bottom-entry socket with 26 pins. An I/O module plugs directly into this socket.
Each I/O module also has a bottom-entry socket for the next module, to allow a stack of up to four I/O modules.

<p align="center">
<Gallery
:images="['/images/spark4/spark4-05.jpg','/images/spark4/spark4-06.jpg','/images/spark4/spark4-14.jpg','/images/spark4/spark4-08.jpg','/images/spark4/spark4-07.jpg','/images/spark4/spark4-15.jpg']"
thumb-size="230px"
/>
</Gallery>
</p>

The advantages of these stackable I/O modules are:

- No cables between boards, which are often the weak link for reliable communication.
- I/O boards do not need a processor or communication chips, just the sensor or actuator circuits.
- I/O boards are not limited to a single protocol. The board-to-board connector has pins for I2C, SPI, UART and GPIO.
  Each board can reroute signals and generates a unique I2C address for the board below to avoid conflicts.
- There is only one processor and one firmware to manage.

This new approach makes it much easier for us to release new I/O modules.
Fewer components are required on each board, usually just the interface ICs for the sensors or actuators.
To support a new I/O module in software, we just need to add a few files to detect and use it to our main firmware.

## A more powerful processor: ESP32
<p align="center">
<Gallery
:images="['/images/spark4/spark4-16.jpg']"
thumb-size="500px"
/>
</Gallery>
</p>

We decided to switch to the ESP32 platform instead of the Particle platform.
Particle's business model focuses on connecting to devices through their cloud.
We never used their cloud, because we think your brewery should not depend on a cloud connection.
This means that our goals and theirs did not always align and we pay a premium for features we don't use.

The ESP32 is much more powerful and has much more memory than the Photon.
This enables us to add more functionality, a nicer display and more reliable communication, at lower cost.

The ESP32 also has bluetooth, which means we can communicate directly with a Tilt in the future.

## A bigger display
The Spark 4 has a new 3.2 inch display, with a 480x320 resolution. This is double the resolution of the Spark 3.
We also switched to capacitive touch instead of resistive touch.

## Wired network with PoE
WiFi is great for its ease of use, but nothing beats wired ethernet in stability.
Especially in larger professional breweries with lots of stainless steel, wired networking is preferred.
That's why the Spark 4 comes with both WiFi and wired ethernet.

On top of that, the Spark 4 supports passive Power-over-Ethernet. This means you can have a single cable to each Spark 4 for both network and power.
The Spark 4 can also be powered from USB or though the power input of one of the connected I/O modules.

## The first I/O module: 1-Wire and flexible GPIO
The first I/O module that will be available for the Spark 4 is for 1-Wire and general purpose I/O.
A Spark 4 with a single GPIO module will allow you to connect 4 of our temperature sensors.

<p align="center">
<Gallery
:images="['/images/spark4/spark4-12.jpg', '/images/spark4/spark4-13.jpg', '/images/spark4/spark4-17.jpg', '/images/spark4/spark4-18.jpg']"
thumb-size="170px"
/>
</Gallery>
</p>

The green terminal block on the left side has 8 multi-purpose GPIO pins. The block on the right is for (optional) power input at 12V or 24V.
For each I/O module, you can configure whether I/O should be at 5V or the external input voltage (12V or 24V).

Each of the GPIO pins is a configurable half H-bridge with fault detection. What does that mean?
It means that each pin can be one of the following:
- A ground pin
- A supply pin
- A low-side switch
- A high-side switch
- A push-pull bidirectional pin
- A digital input

So you can connect the following things:
- A solid state relay (SSR) or a mechanical relay: 1 high side switch and a GND pin.
- A fan: 1 GND pin and 1 high side switch.
- A bidirectional motor or valve: 2 push-pull pins.
- A switch: 1 digital input and a GND pin.

If you have valves that automically close when they lose power, you can even use all pins as high-side switch to connect 8 valves and connect GND externally.
Each pin supports PWM can deliver up to 1A, with a maximum of 6A in total.

If that still does not give you enough pins, you can just add another I/O module!


## Future I/O modules
As said before, this new approach to modular hardware makes it easier for us to create new I/O modules.
We currently have 3 new modules in development, which we plan to release later this year.

### Resistive temperature sensors
Resistive temperature sensors (RTDs) like the PT-100 and PT-1000 are common in professional breweries and are often integrated into the tanks.
This will be the next board that will be released. It will have the same GPIO configuration as the 1-Wire board, but will have an analog front-end instead of 1-Wire.

Personally, I would love to also control my barbeque with Brewblox.
With just an RTD sensor and a fan to control air flow I wil be able to take my low-and-slow grilling and smoking to the next level.

### Pressure sensors
I have been prototyping with pressure sensors for a long time to reach maximum precision and temperature stability.
Pressure sensors will allow level sensing and carbonation control.

### Chemical sensors
We have also created prototypes for chemical sensors and are testing sensing acidity (PH) sensing and oxygen reducing potential (ORP).
For both the chemical and the pressure sensors, we are designing a custom hygienic stainless steel probe.

### DIY I/O modules
With the I2C and SPI pins directly available on the bottom of the Spark 4, it will be easier to add prototype your own custom sensors.
Contact us if you have ideas for this and we can help you get started. If we like your proposal, we might even make it a new officially supported and available I/O module.
