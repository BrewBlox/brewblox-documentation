# Heating elements

Brewing involves heating a lot of water. To reduce waiting time on your brewing day you are best advised to select the highest power heating element your mains outlet can power. Obviously, the element should fit your kettle so these two characteristics are the main criteria for element selection.

In this document we talk you through the pros and cons of different heating elements, how to connect them to your mains, and install them in your kettle.

::: danger Note
Always consult an electrician for advice and help with wiring your elements. Under no circumstances should they be used without proper wiring, ground fault circuit protection and overcurrent circuit protection.
:::

## Heating water

Heating water takes a lot of energy. For example: with a heating element of 3500W it would take 18 minutes to heat 20L of water to 65C for mashing (20 - 65C), or 32 minutes to boil (20 - 100C). Heating water with this setup adds 50 minutes of waiting time to your brewing day. However, if you were to switch to 50L batches, the waiting time already adds up to more than two hours. Select a higher power heating element when your mains outlet allows. You can calculate the expected heating time in your situation with the calculator below.

TODO: Elco vragen stuk schrijven over waarom hoog-vermogen elementen, ramp-up tijden, etc.
TODO: Bob vragen interactieve heating time calculator te maken in vuepress.

<!-- ### calculator

### Formula:

$$\Delta t = \frac{c_p \cdot M \cdot \Delta T}{P \cdot 60} = \text{XX min}$$

| Variable   | Description                                          | Unit(s) / Value(s)                                           | Interactive use                                      |
|:----------:|------------------------------------------------------|--------------------------------------------------------------|------------------------------------------------------|
| $\Delta t$ | heating time (time difference)                       | min (round to int sufficient)                                | result                                               |
| $c_{p}$    | Specific heat capacity (isobaric mass heat capacity) | 4.18 kJ / (kg * K) for water (l)                             | constant                                             |
| $M$        | Mash (water) mass                                    | kg, calculate from L / Gal (US Gal), 1L = 1kg, 1Gal = 3.79kg | interactive value + unit - default: 40 L             |
| $\Delta T$ | Mash temperature difference                          | C / F, 1C = 5/9F                                             | interactive value + unit - default: (65 - 20) = 45 C |
| $P$        | Power heating element                                | W                                                            | interactive value - default: 3600W                   |

Default example: It takes 45 (44.8) mins to heat 50L of water 45C (20 to 65C) with a 3500W heating element. -->

## Mains electricity

BrewPi heating elements work at 230 / 240 V AC. How the elements are connected to your mains depends on where you live. In this section we talk you through the three main configurations and show you how to determine the maximum current and power of the heating element you can connect safely. When unsure about the details of your mains, consult a local electrician.

### Single phase

With the exception of North- and Central-America most residential mains outlets worldwide are single phase outlets operating at 230V AC. With single phase outlets, the heating element is connected between the phase (L) and neutral (N) wire.

![1-Phase power](../images/1-phase.svg)

In most places, 230V single phase outlets are protected by 16A circuit breakers.

### Split phase

In the US, Canada and some other countries mains electricity operates at 120V AC. For high-power electrical appliances (like heating elements, stoves, etc.) houses in the US are equipped with split phase outlets. In split phase outlets two phases (L1 and L2) at 120V are combined to 240V AC. The heating element is connected between phase L1 and L2, see figure.

![2-Phase power](../images/2-phase.svg)

In the US, split phase outlets are typically protected by a 25A circuit breaker.

### Three phase

Three phase mains connections are the high-power electrical connections outside North- and Central-America. They consist of three phases (L1 - L3) and a neutral (N) wire. To fully utilize the available power of a three phase outlet requires a three phase heating element. Essentially a three phase heating element consists of three single phase elements combined in a single flange. Three phase elements should be connected **in star configuration**.

**Star configuration:** in a three phase star configuration the individual elements are connected between the phase (L1 - L3) and neutral (N). The voltage over each element is 230V AC. In some countries the neutral (N) wire is omitted from the outlet. If so, you can get away with not connecting the neutral wire as BrewPi heating elements are balanced in power. In star configuration currents from the three individual elements cancel in the center, and the neutral wire can be omitted.

The second connection option is the delta configuration. With the exception of Norway, BrewPi heating elements should **never** be connected in delta configuration as it will fry your element.

**Delta configuration:** in a three phase delta configuration the individual heating elements are connected between two adjacent phases. For example: element 1 is connected between L1 and L2, element two between L2 and L3, etc. The voltage over each element is 400V AC. Our heating elements are dimensioned to operate at 230 - 240 V AC, operation at 400V AC draws too much current (power) and is unsafe (fire hazard). BrewPi heating elements cannot be used in three phase delta configuration. **Exception:** in large parts of Norway electrical power is distributed over three phase connections with a voltage of 230V AC phase to phase (instead of 400V AC). In this case connecting your element in delta configuration is safe.

![3-Phase power](../images/3-phase.svg)

In the Netherlands three phase connections operate at 230V AC and are protected by 3x16 or 3x25A circuit breakers.

### Protective Earth

When working with electrical equipment, anything you can touch should be grounded for safety reasons. This is especially true in a potentially wet brewing environment and is to ensure you never get in contact with the AC voltage from your mains. When the AC voltage does touch the equipment exterior, it will run to ground and trip your Ground-Foult Circuit Breaker (GFCB). BrewPi heating elements are equipped with a Protective Earth (PE) terminal to ground the exterior of your heating element and kettle.

### Maximum current

To protect the electric circuit in your building from an overload or short circuit (fire hazard) it is protected by a circuit breaker or (in old buildings) a fuse. The circuit breaker limits the current that can be drawn from a mains outlet and determines the maximum power of the heating element your can safely connect.

To reduce waiting time at your brewing day we would advise you to buy the highest power heating element your mains outlet can power. Therefore you should find the maximum current ($I_{max}$) of the circuit breaker behind the outlet on your brewing location. Ask your electrician when you are unsure about the details of your electrical installation.

You can select your heating element based on the maximum current or maximum power ($P_{max}$) of the outlet you plan to use. The maximum power is determined by multiplying the voltage of your mains ($U$) by the maximum current of the circuit breaker; $P_{max} = U \times I_{max}$.

**Examples:**
- **Single phase:** typical residential mains outlets in the Netherlands are protected by a circuit breaker with a maximum current of 16A. Operating at 230V AC, outlets have a maximum power of 3680W.
- **Split phase:** typical split phase outlets in the US are protected by a circuit breaker with a maximum current of 25A. Operating at 240V AC these outlets have a maximum power of 6000W.
- **Three phase:** residential three phase connections in the Netherlands come in two flavors; 3x16 and 3x25A rated current. At 230V AC these connections have a maximum power of 11040 or 17250W respectively.

The examples are listed in the table below for an overview.

| Type         | Voltage (V) | Max. current (A) | Max. power (W) | Location |
|--------------|------------:|-----------------:|---------------:|---------:|
| Single phase |         230 |               16 |           3680 |        NL|
| Split phase  |       2x120 |               25 |           6000 |        US|
| Three phase  |         230 |     3x16<br>3x25 | 11040<br>17250 |        NL|

**Note:** typically a circuit breaker protects a group of outlets in a building. BrewPi heating elements are intentionally dimensioned a few 100W below the maximum power of most common circuit breakers. This allows connecting some other small electrical appliances like a pump, light, or radio to the same group without problems.

## Elements

At BrewPi we sell low watt density (4 - 13 W/cm<sup>2</sup>) heating elements. Heating elements are designed produce heat, and heat production is measured in watts. A low watt density heating element produces a low amount of heat per element surface area. This prevents scorching your elements with mash sugars, and ensures they are easy to clean after brewing. At the same time it prevents scorching your brew and the possible production of burnt off-flavors that might ruin your beer. BrewPi heating elements come in three types, round, foldback and tri-clamp. All elements are made from stainless steel for durability and hygiene reasons.

### Round

At BrewPi we sell custom designed round heating elements. Round elements heat your mash / wort more homogeneous, are minimally blocking the flow when whirlpooling and have the lowest watt density of all the elements we sell. When mounted in a kettle with the design diameter there is a 5cm (2in) gap between the element and the kettle wall, see photo. The elements come in two types; 1-phase elements with one resistor per flange, and 3-phase elements with 3. Especially the 3-phase elements have an extremely low watt density, which makes scorching your element practically impossible. All elements have a protective earth terminal, and come with a mounting kit to protect the electrical wiring from liquids.

![Heating elements-round](../images/heat-element-round.jpg)

TODO: Elco, foto rond element in ketel nog maken.

<TableRound/>

TODO: Elco - power per resistor weggehaald, te veel data.

### Foldback

Foldback heating elements are straight elements fold back, hence the name. The fold increases the element surface area, thereby lowering the watt density and risk of scorching.

![Heating elements-foldback](../images/heat-element-foldback.jpg)

<TableFoldback/>

TODO: XX BrewPi part. no. nog aanpassen

#### Mounting kit

The basic design of these foldback elements does not provide a protective earth terminal, nor a cover for the wiring. To overcome these deficiencies we have designed a custom mounting kit, see photos below. The mounting kit is sold separately, and can be found in the ![store](https://store.brewpi.com/mashing/stainless-steel-heating-elements/heating-element-mounting-kit). With the mounting kit installed your element and kettle are grounded, and the wiring is safe from liquids.

![Foldback-mounting kit](../images/mounting-kit.jpg)

#### Tri-clamp

Tri-clamp elements are fixed in your kettle with a tri-clamp fitting. These fittings consist of two flanges, an O-ring, and a clamp band (hence *tri*-clamp) and are the best option if you want to be able to easily remove the element from the kettle. This comes in handy when you want to change your element frequently, or want to clean it thoroughly outside the kettle. Our tri-clamp heating elements come with a mounting kit, and require a 2" tri-clamp ferrule (64mm OD, 43mm ID) installed on your kettle.

![Heating elements-triclamp](../images/heat-element-triclamp.jpg)

<TableTriclamp/>

## Connecting

Now you have selected your element(s) we can discuss how to connect them to your mains.

::: danger Note
Always consult an electrician for advice and help with wiring your elements. Under no circumstances should these be used without proper wiring, ground fault circuit protection and overcurrent circuit protection.
:::

### Single phase outlet

To connect an heating element to a single phase outlet requires connecting three wires; phase (L), neutral (N) and protective earth (PE). All BrewPi heating elements can be connected to a single phase outlet. The 2 and 3 resistor elements come with metal strips to connect the resistors in parallel. How to connect your element is shown schematically in the figure below, with photos showing the configuration of the metal strips. How to determine the current the element draws is described in the examples. Make sure your wiring and circuit breaker can handle the amount of current drawn by the element.

![1-phase-connect-123](../images/1-phase-connect-123.svg)

TODO: Elco mening over PE-terminal? Locatie feitelijk niet helemaal correct...

**Examples:**
- Round BrewPi heating element [#7](#round) has one resistor and draws a current of 15.2A when connected to a 230V outlet.
- Tri-clamp element [#14](#tri-clamp) has two resistors and draws a current of 6.1A per resistor at 230V. When connected in parallel to a 230V single phase outlet the element will draw a current of 2 x 6.1 = 12.2A.
- Round heating element [#2](#round) has three resistors and draws a current of 12.3A per resistor at 230V. When connected in parallel to a 230V single phase outlet the element will draw a current of 3 x 12.3 = 36.9A.

The wires connected to your element should be of sufficient gauge (diameter) to transport the current, and the current should not exceed the maximum current of your circuit breaker. More about wire gauge [here](#wire-gauge).

TODO: Elco, welk woord gebruiken? Gauge / diameter?

### Split phase outlet

In connecting your element to a 240V split phase outlet you have the same options and procedure as when connecting it to the single phase outlet discussed previously. Just replace phase (L) with phase 1 (L1), and neutral (N) with phase 2 (L2) in the wiring, as shown in the scheme below. In determining the total current drawn by the element you base it on the current per resistor values at 240V from the tables in the [elements](#elements) section.

![2-phase-connect-123](../images/2-phase-connect-123.svg)

### Three phase outlet

Connecting a 3 resistor element to a three phase outlet requires connecting 5 wires; phase 1-3 (L1 - L3), neutral (N) and protective earth (PE). How to connect your element is shown in the figure below, with a photo showing how to configure the metal strips. How to determine the current drawn by the element is described in the example. As discussed in the [Mains](#three-phase) section, always connect your BrewPi 3-phase heating elements in the star configuration shown here. The 400V AC of the delta configuration will draw too much current and fry your element (fire hazard). When your 3 phase outlet comes without a neutral (N), it can be omitted as discussed [before](#three-phase).

![3-Phase power](../images/3-phase-connect-3.svg)

**Example:**
- Round BrewPi heating element [#4](#round) has three resistors and draws a current of 14.5A per phase when connected to a 230V three phase outlet.

The wires connected to your element should be of sufficient gauge (diameter) to transport the current, and the current should not exceed the maximum current of your circuit breaker. More about wire gauge in the [next](#wire-gauge) section.

### Wire gauge

The wires connected to your element should be of sufficient diameter (gauge) to transport the current drawn by your element. In the US and Canada diameters of electrical wires are standardized in the American Wire Gauge (AWG). Bigger diameter wires get a lower number. Typical 14-gauge wires and cables can carry 15A of current, 12-gauge can carry 20A. In Europe and most of the rest of the world, electrical wires are specified by their cross-sectional area measured in square millimeters (mm<sup>2</sup>). For instance, the 3 and 5 wire cables we [sell](https://store.brewpi.com/temperature-control/cables) at BrewPi consist of 2.5mm<sup>2</sup> wires and can carry 16A of current. When unsure, ask your local hardware store or electrician about the required cable diameter for your element.

TODO: maximum kabel stroom staat niet in de store, hoe mee om gaan?

## Installation

To install the heating element in your kettle requires creating a 1-2" hole in the kettle wall. Drill bits are not available at these diameters, and so we recommend you get a sheet metal hole punch for a nice, clean hole in your kettle without any burrs.

![Hole Punch](../images/hole-punch.jpg)

We sell hole punches in the [store](https://store.brewpi.com/), which one you should get is listed in the table below. The hole punches are a little bigger to accommodate the thread of the element. For tri-clamp elements we assume you have a kettle with a tri-clamp ferrule preinstalled, or know what you are doing when welding one on there.

| Element type |   Thread |         Hole punch |
|--------------|---------:|-------------------:|
| Round        | 1.5" BSP |     [47mm][HP47mm] |
| Foldback     |   1" BSP | [32.5mm][HP32-5mm] |

Hole punches require a small pilot hole for the bolt that pulls the cutter through the wall. When drilling in stainless steel we advise you to get a cobalt head drill bit, and a low-speed, high-torque drill. We advise you to cool your drill bit with running oil / water while drilling. A 40mm adjustable wrench is needed to pull the cutter through the kettle wall, and tighten the locknut of the heating element.

[HP47mm]: https://store.brewpi.com/mashing/tools/q-max-sheet-metal-hole-punch-47mm
[HP32-5mm]: https://store.brewpi.com/mashing/tools/q-max-sheet-metal-hole-punch-32-5mm

TODO: Verhaal over heating element hoogte boven de bodem?
TODO: vraag Elco, wordt er een handleiding meegeleverd bij de elementen? Vergelijkbaar met handleiding foldback mounting kits? Maximale wanddikte hole punch noemen? Beetje laag...

## Operation

In many steps of the brewing process, temperature is critical. For instance, during mashing you typically want your mash to be about 65C (~150F), dependent on the type of grain you use, and the style of beer you brew. Maintaining the mash temperature at 65C requires switching the AC voltage to your heating element as keeping it on continuously will overheat the mash. Relays allow you to switch high AC voltages with a small DC voltage and can be used to build a control loop to get your mash to 65C and keep it there.

### Pulse Width Modulation


### Solid State Relays

Traditional relays are mechanical switches with (for example) an electromagnet and a spring. A small DC voltage activates the electromagnet, and closes the switch. The spring opens the switch when the DC voltage is absent. At BrewPi we sell Solid-State Relays (SSRs) which are based on semiconductor technology. SSRs have a longer operational lifetime and the added benefit that they can switch at the zero-crossing of the AC voltage. Switching at the zero-crossing prevents the possibility of high inrush currents that plague mechanical relays and cause voltage dips. Voltage dips are not so nice for the rest of your electrical equipment near your brewing location and can cause malfunction, or worse.

Next to the heating element and the SSR, the control loop consists of a temperature sensor installed in your kettle to keep an eye on the mash temperature, and a controller. The controller interprets the temperature from the sensor, and switches the heating element by providing a small DC voltage to the SSR when needed. The BrewPi Spark is especially designed for this purpose, and can be found in the store.

TODO: PWM vermelden? Plaatje (grafiek) PWM maken? Bestaat die niet al?

#### Heat sink

Single phase SSRs transporting over 2A of current will get hot, and require a heat sink for continuous operation. Three phase SSRs are only used for switching high amounts of electrical power, and always require a heat sink. Low-profile heat sinks can be found in the BrewPi store (TODO: link naar store).

![SSR-heat-sink](../images/SSR-heat-sink.jpg)

#### Dry fire protection

 Our heating elements are designed to heat water and will overheat and scorch when fired in air. Hence you want to install a water level float switch (float switch) in your kettle to add dry fire protection to your heating element. Make sure the switch switches only *after* the heating element is fully submerged. How to include the float switch in your control loop will be discussed in the [next](#operation) section. For automated brewing setups you might want a to add float switch at the top of your kettle too, to prevent it from overflowing.

 ![Float-sensor](../images/float-switch.jpg)

### Connecting your SSR

The SSR is used to switch the AC voltage to your heating element and thus needs to be installed in the cable in between the element and your mains outlet (see photo). Single phase SSRs (left) can be used to switch AC voltages from single phase outlets. Just interrupt one of the current carrying wires (L or N) with the AC voltage terminals 1 and 2 on the SSR. Make sure the protective earth (PE) wire remains connected to your element. Split phase outlets have the same basic configuration. Just interrupt wire L1 or L2. For elements connected to three phase outlets we sell three phase SSRs (right). Three phase SSRs are mounted in between the actual phases (L1 - L3), and wires N and PE remain uninterrupted.

#### Single phase

![Connect-1-phase-SSR](../images/Connect-1-phase-SSR.svg)

#### Split phase

![Connect-2-phase-SSR](../images/Connect-2-phase-SSR.svg)

#### Three phase

![Connect-3-phase-SSR](../images/Connect-3-phase-SSR.svg)


Make sure the maximum current of the SSR exceeds the current drawn by your specific element-mains configuration. In the store we sell single phase SSRs with a maximum current of 10 and 40A, three phase SSRs with a maximum current of 20 and 30A. Next to that we sell a 10A DC voltage SSR to switch DC heaters, pumps and fans. All our SSRs come with a LED switch status indication. LED ON = switch closed.

### Two elements, one outlet

TODO: plaatje (schema) van element met SSR, flow switch, spark maken?
TODO: plaatje (schema) van 2 elementen, 2 SSR's, etc. maken?
