<script>
export default {
  name: 'TableTriclamp',
  data: () => ({
    values: [
      {
        title: '#',
        values: [14, 15, 16, 11, 12, 13],
      },
      {
        title: 'Length (cm)',
        length: 'cm',
        values: [30, 35, 42, 32, 42, 52],
      },
      {
        title: 'Min. kettle ⌀ (cm)',
        length: 'cm',
        values: [30, 35, 42, 32, 42, 52],
      },
      {
        title: 'Length (in)',
        length: 'inch',
        values: [11.8, 13.8, 16.5, 12.6, 16.5, 20.5].map((v) => v.toFixed(1)),
      },
      {
        title: 'Min. kettle ⌀ (in)',
        length: 'inch',
        values: [11.8, 13.8, 16.5, 12.6, 16.5, 20.5].map((v) => v.toFixed(1)),
      },
      {
        title: 'No. Resistors',
        values: [2, 2, 2, 3, 3, 3],
      },
      {
        title: 'Current per resistor (A)',
        voltage: '230V',
        values: [6.1, 7.0, 10.9, 8.0, 12.3, 14.5].map((v) => v.toFixed(1)),
      },
      {
        title: 'Power (W)',
        voltage: '230V',
        values: [2800, 3200, 5000, 5500, 8500, 10000],
      },
      {
        title: 'Watt density (W/cm²)',
        voltage: '230V',
        values: [8.8, 8.3, 10.3, 10.6, 11.7, 10.7].map((v) => v.toFixed(1)),
      },
      {
        title: 'Current per resistor (A)',
        voltage: '240V',
        values: [6.4, 7.3, 11.3, 8.3, 12.9, 15.1].map((v) => v.toFixed(1)),
      },
      {
        title: 'Power (W)',
        voltage: '240V',
        values: [3050, 3500, 5450, 6000, 9250, 10900],
      },
      {
        title: 'Watt density (W/cm²)',
        voltage: '240V',
        values: [9.6, 9.0, 11.2, 11.5, 12.7, 11.7].map((v) => v.toFixed(1)),
      },
    ],
  }),
};
</script>

<template>
  <HardwareTableTemplate :columns="values" />
</template>
