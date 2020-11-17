# ToDo

buy guide:
- max. elektrisch mogelijk (stoppen)
- intro opwarmen water theorie (rekenvoorbeeld / calculator)
- faseaansluiting opties: EU1, EU3, US2 (voorbeeld: https://community.brewpi.com/t/heat-element-size/501)
- watt density (ultralow watt density 14 W/cm2 - camco / Excel Elco)
- shape / mounting options / dimensions / materials
  - foldback
  - round
  - triclamp
- control / electric connection / grounding / overcurrent protection
  - SSR + heat sink
  - Spark
  - Float switch
  - PWM control (software support Mutex + Load Balancing)
- Mounting Tools
  - hole punch
  - cabling
  - Sealing

- mount 3-phase element on 1-phase contact

- Electrical installation

Opmaak:
- tekst: markdown
- plaatjes: svg?

# Heating time calculator

Bob vragen interactieve heating time calculator te maken in vuepress.

### Formula:

$$\Delta t = \frac{c_{p} \cdot V \cdot \Delta T}{P} = \text{XX min}$$

### Variables:

 <table>
  <tr>
    <th>Variable</th>
    <th>Description</th>
    <th>Unit(s) / Value(s)</th>
    <th>Interactive use</th>
  </tr>
  <tr>
    <td>$\Delta t$*</td>
    <td>heating time (time difference)</td>
    <td>min</td>
    <td>result</td>
  </tr>
  <tr>
    <td>$c_{p}$*</td>
    <td>Specific heat capacity (isobaric mass heat capacity)</td>
    <td>4.18 kJ / (kg * K) for water (l)</td>
    <td>constant</td>
  </tr>
  <tr>
    <td>V</td>
    <td>Mash (water) volume to heat</td>
    <td>L / Gal (US Gal) 1L = 1kg / 1Gal = 3.79kg</td>
    <td>interactive value + unit - default: 40L</td>
  </tr>
  <tr>
    <td>$\Delta T$*</td>
    <td>Mash temperature difference</td>
    <td>C / F, 1C = 5/9F</td>
    <td>interactive value + unit - default: 45C</td>
  </tr>
  <tr>
    <td>P</td>
    <td>Power heating element</td>
    <td>W</td>
    <td>Interactive value - default: 5500W</td>
  </tr>
</table>

*mathjax markdown commands werken niet in HTML

Default example: It takes 23 (22.8) mins to heat 40L of water 45C (20 to 65C) with a 5500W heating element.