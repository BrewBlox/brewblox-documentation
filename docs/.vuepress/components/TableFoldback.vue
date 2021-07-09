<script>
export default {
  name: 'TableFoldback',
  data: () => ({
    values: [
      {
        title: 'Name',
        url: true,
        values: [
          { 
            title: 'element_2800', 
            url: 'https://store.brewpi.com/stainless-steel-foldback-heating-element-2800w-27cm',
          }, 
          { 
            title: 'element_3200', 
            url: 'https://store.brewpi.com/stainless-steel-foldback-heating-element-3200w-32cm',
          }, 
        ],
      },
      {
        title: 'Length\n (cm)',
        length: 'cm',
        values: [27, 32],
      },
      {
        title: 'Min. kettle\n ⌀ (cm)',
        length: 'cm',
        values: [30, 35],
      },
      {
        title: 'Length\n (in)',
        length: 'inch',
        values: [10.6, 12.6].map((v) => v.toFixed(1)),
      },
      {
        title: 'Min. kettle\n ⌀ (in)',
        length: 'inch',
        values: [11.8, 13.8].map((v) => v.toFixed(1)),
      },
      {
        title: 'No.\n Resistors',
        values: [1, 1],
      },
      {
        title: 'Current\n (A)',
        voltage: '230V',
        values: [12.2, 13.9].map((v) => v.toFixed(1)),
      },
      {
        title: 'Power\n (W)',
        voltage: '230V',
        values: [2800, 3200],
      },
      {
        title: 'Watt density\n (W/cm²)',
        voltage: '230V',
        values: [11, 11],
      },
      {
        title: 'Current\n (A)',
        voltage: '240V',
        values: [12.7, 14.5].map((v) => v.toFixed(1)),
      },
      {
        title: 'Power\n (W)',
        voltage: '240V',
        values: [3050, 3500],
      },
      {
        title: 'Watt density\n (W/cm²)',
        voltage: '240V',
        values: [12, 12],
      },
    ],
  }),
};
</script>

<template>
  <HardwareTableTemplate :columns="values" />
</template>
