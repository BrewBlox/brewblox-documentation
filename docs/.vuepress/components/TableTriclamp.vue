<script>
export default {
  name: 'TableTriclamp',
  data: () => ({
    values: [
      {
        title: 'Name',
        url: true,
        values: [
        {
          title: 'BPI_TC_2800',
          url:'https://store.brewpi.com/tri-clamp-heating-element-for-brewing-30-cm-2800w-in-2-loops-2-inch-clamp-64-mm',
        },
        {
          title: 'BPI_TC_5500',
          url: 'https://store.brewpi.com/tri-clamp-heating-element-for-brewing-32-cm-5500w-2-inch-clamp-64-mm',
        },
        {
           title: 'BPI_TC_3200',
           url:'https://store.brewpi.com/tri-clamp-heating-element-for-brewing-35-cm-3200w-in-2-loops-2-inch-clamp-64-mm',
        },
        {
          title: 'BPI_TC_5000',
          url:'https://store.brewpi.com/tri-clamp-heating-element-for-brewing-42-cm-5000w-in-2-loops-2-inch-clamp-64-mm'
        },
        { 
          title: 'BPI_TC_8500',
          url:'https://store.brewpi.com/tri-clamp-heating-element-for-brewing-42-cm-8500w-in-3-loops-2-inch-clamp-64-mm',
        },
        {
          title: 'BPI_TC_10000',
          url:'https://store.brewpi.com/tri-clamp-heating-element-for-brewing-52-cm-10000w-in-3-loops-2-inch-clamp-64-mm',
        }
      ],
      },
      {
        title: 'Length\n (cm)',
        length: 'cm',
        values: [30, 32, 35, 42, 42, 52],
      },
      {
        title: 'Min. kettle\n ⌀ (cm)',
        length: 'cm',
        values: [30, 32, 35, 42, 42, 52],
      },
      {
        title: 'Length\n (in)',
        length: 'inch',
        values: [11.8, 12.6, 13.8, 16.5, 16.5, 20.5].map((v) => v.toFixed(1)),
      },
      {
        title: 'Min. kettle\n ⌀ (in)',
        length: 'inch',
        values: [11.8, 12.6, 13.8, 16.5, 16.5, 20.5].map((v) => v.toFixed(1)),
      },
      {
        title: 'No.\n Resistors',
        values: [2, 3, 2, 2, 3, 3],
      },
      {
        title: 'Current per\n resistor (A)',
        voltage: '230V',
        values: [6.1, 8.0, 7.0, 10.9, 12.3, 14.5].map((v) => v.toFixed(1)),
      },
      {
        title: 'Total power\n (W)',
        voltage: '230V',
        values: [2800, 5500, 3200, 5000, 8500, 10000],
      },
      {
        title: 'Watt density\n (W/cm²)',
        voltage: '230V',
        values: [8.8, 10.6, 8.3, 10.3, 11.7, 10.7].map((v) => v.toFixed(1)),
      },
      {
        title: 'Current per\n resistor (A)',
        voltage: '240V',
        values: [6.4, 8.3, 7.3, 11.3, 12.9, 15.1].map((v) => v.toFixed(1)),
      },
      {
        title: 'Total power\n (W)',
        voltage: '240V',
        values: [3050, 6000, 3500, 5450, 9250, 10900],
      },
      {
        title: 'Watt density\n (W/cm²)',
        voltage: '240V',
        values: [9.6, 11.5, 9.0, 11.2, 12.7, 11.7].map((v) => v.toFixed(1)),
      },
    ],
  }),
};
</script>

<template>
  <HardwareTableTemplate :columns="values" />
</template>
