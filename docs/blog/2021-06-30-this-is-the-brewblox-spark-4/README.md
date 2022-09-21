# This is the new Brewblox Spark 4

We are proud to finally announce the next generation of our brewery controller: the Brewblox Spark 4.

This upgrade is a much bigger change than the Spark 2 to 3: we are taking hardware flexibility to the next level.
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

We decided to take a new approach to hardware modularity for the Spark 4.
On the Spark 3, additional sensor and actuator boards were connected with cables and used the 1-Wire protocol.
The hardware supported RS-485, but never released an expansion board that used it.

### The downsides of 1-wire

The 1-Wire protocol is great for its simplicity and costs, but it comes with some major downsides:

- All devices share a single bus. If one of them fails, it can take down all other devices.
- Long cables can cause communication errors.
- 1-Wire devices do not have a fail-safe mechanism. A 1-Wire actuator will remember its last state. If it loses connection with the main processor, it will just be stuck in the last state it was set to.

To make actuators smarter, they would need to have a bit of extra software inside.
But that means they would need their own microcontroller and firmware.
This would increase the cost and complexity of expansion boards, both in hardware and software.

### A new approach: stackable I/O modules

The Spark 4 uses a new approach for connecting sensors and actuators: they can be plugged directly into the main processor.
Through the bottom of the Spark 4, an I/O module can plug into a 26-pin connector.
Each I/O module also has a socket for the next module, to allow a stack of up to four I/O modules.

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
- I/O boards are not limited to a single protocol. The board-to-board connector has pins for I2C, SPI, UART, and GPIO.
  Each board can reroute signals and generates a unique I2C address for the next board to avoid conflicts.
- There is only one processor and one firmware to manage.

This new approach makes it easier for us to release new I/O modules.
Each board requires fewer components, usually just the interface ICs for the sensors or actuators.
To support a new I/O module, we also just need to add a few files for the specific ICs to our main firmware.

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
This means that our goals and theirs did not always align and we paid a premium for features we don't use.

Compared to the Photon inside the Spark 2 and 3, the ESP32 is much more powerful and has much more memory.
This allows us to add more functionality and a nicer display, at lower cost.

The ESP32 also has Bluetooth, which means we can communicate directly with a Tilt sensor or other Bluetooth device in the future.

## A bigger display

The Spark 4 has a new 3.5 inch display, with a 480x320 resolution. This is twice the resolution of the Spark 3.
We also switched to capacitive touch instead of resistive touch for better responsiveness.

## Wired network with PoE

WiFi is great for its ease of use, but nothing beats wired ethernet in stability.
Especially in larger professional breweries with lots of stainless steel, wired networking is preferred.
That's why the Spark 4 comes with both WiFi and wired ethernet.

On top of that, the Spark 4 supports passive Power-over-Ethernet. This means you can have a single cable to each Spark 4 for both network and power.
The Spark 4 can also be powered from USB or through the power input of one of the connected I/O modules.

## The first I/O module: 1-Wire and flexible GPIO

The first I/O module available for the Spark 4 is for 1-Wire and general-purpose I/O.

<p align="center">
<Gallery
:images="['/images/spark4/spark4-12.jpg', '/images/spark4/spark4-13.jpg', '/images/spark4/spark4-17.jpg', '/images/spark4/spark4-18.jpg']"
thumb-size="170px"
/>
</Gallery>
</p>

On one side, this GPIO module lets you plug in 4 of our temperature sensors.

On the other side are green terminal blocks, in a block of 8 and a block of 2 pins.
The 2-pin block is for (optional) external power at 12V or 24V. The 8-pin terminal block is for GPIO.

For each I/O module, you can configure whether I/O should be at 5V or the external input voltage (12V or 24V).

Each of the 8 GPIO pins is a configurable half H-bridge with fault detection. What does that mean?

It means that each pin can be one of the following:

- Positive supply voltage (5V or external input voltage)
- Negative supply voltage (GND, 0V)
- A low-side switch
- A high-side switch
- A push-pull bidirectional pin
- A digital input

Some examples of what you can connect are:

- A solid-state relay (SSR) or a mechanical relay: 1 high side switch and a GND pin.
- A fan: a GND pin and a high-side switch.
- A bidirectional motor or valve: 2 push-pull pins.
- A switch: a digital input and a GND pin.

If you have valves that automatically close when they lose power, you can even use all pins as a high-side switch to connect eight valves to the board and connect GND to them externally.
Each pin can source or sink up to 1A, but multiple pings can be combined if you need more current.
All pins also support individual PWM for speed/intensity control.

As you can see, these eight are suitable for many situations. And if one I/O module still does not give you enough pins, you can still add another I/O module!

## Future I/O modules

As said before, this new approach to modular hardware makes it easier for us to create new I/O modules.
We already have three new modules in development.

### Resistive temperature sensors

Resistive temperature sensors (RTDs), like the PT-100 and PT-1000, are common in professional breweries and are often integrated into tanks.
A module for RTD sensors will be the second I/O module we will release. It will have the same GPIO configuration as the 1-Wire module, but it will have an analog front-end instead of 1-Wire.

RTD sensors will be able to measure higher temperatures. 1-Wire sensors only go up to 115 &deg;C.

### Pressure sensors

Pressure sensors will allow level sensing and carbonation control in the future.
We have been developing and testing boards to measure pressure with maximum precision and temperature stability.

### Chemical sensors

We are also testing chemical sensors for measuring acidity (PH) and oxygen-reducing potential (ORP).
For both chemical and pressure sensors, we are designing a custom hygienic stainless steel probe.

### Your DIY I/O modules?

With the I2C and SPI pins directly available on the bottom of the Spark 4, it will be easier to prototype your own sensors.
Please contact us if you have ideas for new sensors and would like to collaborate.

## How will the Spark 4 fit in your brewery?

As you can see, the Spark 4 will be very flexible. It will fit almost any brewery.

### Our Brewblox software

This hardware upgrade brings the Spark in line with the flexibility of our new Brewblox software platform.
Brewblox lets you fully customize your control schemes, graphs, dashboards, interactive flow diagrams, and more.

Each brewery will have a central Brewblox server, which you can run on a Raspberry Pi or a bigger Linux server.
Multiple Spark 4 controllers can all connect to this central server to show you an overview of your entire brewery in one place.

Introducing all the new functionality in Brewblox is a topic for another post.
We will slowly phase out the BrewPi name and transition to our name Brewblox.

The Spark is not based on the Raspberry Pi, the Raspberry Pi is just one of the hardware options for the Brewblox server.
The Brewblox name aligns better with our modular approach to brewery control.

### One or more Sparks?

For maximum reliability, we recommend to keep sensor and actuator wires short: put the controller close to the tank.
We recommend a Spark 4 per 1 or 2 tanks for professional breweries. Just the network cable should go to the central hub.
Don't misuse the module system to wire your entire brewery to a single point.
It does make sense to use four I/O boards with a single Spark if you if you want to control 16 motorized valves in a HERMS.

### Optional display and casing

We designed a new casing for the Spark 4, which can be 3d-printed.
You can buy it with the Spark 4 or print it yourself.

If you plan to mount the Spark 4 in a project box, the display and case don't make much sense.
That is why you can also opt to buy the Spark 4 without them, which saves costs and space.

With simple brackets, the Spark and the I/O modules can be clicked onto on a DIN rail inside your box.

## What do you think?

Let us know your thoughts [on our community forum](https://community.brewpi.com/t/this-is-the-spark-4/).
