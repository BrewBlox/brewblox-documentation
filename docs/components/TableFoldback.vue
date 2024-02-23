<script setup>
import HardwareTableTemplate from './HardwareTableTemplate.vue';

const values = [
  {
    title: '#',
    values: ['XX', 'XX'],
  },
  {
    title: 'Length (cm)',
    length: 'cm',
    values: [27, 32],
  },
  {
    title: 'Min. kettle ⌀ (cm)',
    length: 'cm',
    values: [30, 30],
  },
  {
    title: 'Length (in)',
    length: 'inch',
    values: [10.6, 12.6].map((v) => v.toFixed(1)),
  },
  {
    title: 'Min. kettle ⌀ (in)',
    length: 'inch',
    values: [11.8, 13.8].map((v) => v.toFixed(1)),
  },
  {
    title: 'No. Resistors',
    values: [1, 1],
  },
  {
    title: 'Current (A)',
    voltage: '230V',
    values: [12.2, 13.9].map((v) => v.toFixed(1)),
  },
  {
    title: 'Power (W)',
    voltage: '230V',
    values: [2800, 3200],
  },
  {
    title: 'Watt density (W/cm²)',
    voltage: '230V',
    values: [11, 11],
  },
  {
    title: 'Current (A)',
    voltage: '240V',
    values: [12.7, 14.5].map((v) => v.toFixed(1)),
  },
  {
    title: 'Power (W)',
    voltage: '240V',
    values: [3050, 3500],
  },
  {
    title: 'Watt density (W/cm²)',
    voltage: '240V',
    values: [12, 12],
  },
];
</script>

<template>
  <HardwareTableTemplate :columns="values" />
</template>
