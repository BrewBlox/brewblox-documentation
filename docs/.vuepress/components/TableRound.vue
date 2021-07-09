<script>
export default {
  name: 'TableRound',
  data: () => ({
    values: [
      {
        title: 'Name',
        url: true,
        values: [
          { 
            title: 'BPI_008',
            url: 'https://store.brewpi.com/round-heating-element-for-brewing-25cm-diameter-5500w',
          },
          {
            title: 'BPI_011',
            url: 'https://store.brewpi.com/round-heating-element-for-brewing-25cm-diameter-2800w', 
          },
          {
            title: 'BPI_006', 
            url: 'https://store.brewpi.com/round-heating-element-for-brewing-30cm-diameter-32000w', 
          },
          {
            title: 'BPI_009',
            url: 'https://store.brewpi.com/round-heating-element-for-brewing-30cm-diameter-5500w',
          },
          {
            title: 'BPI_007', 
            url: 'https://store.brewpi.com/round-heating-element-for-brewing-35cm-diameter-35000w',
          },
          {
            title: 'BPI_001',
            url: 'https://store.brewpi.com/round-heating-element-for-brewing-35cm-diameter-8500w',
          },
          {
            title: 'BPI_010',
            url: 'https://store.brewpi.com/round-heating-element-for-brewing-35cm-diameter-5500w',
          },
          {
            title: 'BPI_002',
            url: 'https://store.brewpi.com/round-heating-element-for-brewing-40cm-diameter-8500w',
          },
          {
            title: 'BPI_003',
            url: 'https://store.brewpi.com/round-heating-element-for-brewing-50cm-diameter-10000w',
          },
          {
            title: 'BPI_004',
            url: 'https://store.brewpi.com/round-heating-element-for-brewing-60cm-diameter-10000w',
          },
          {
            title: 'BPI_005',
            url: 'https://store.brewpi.com/round-heating-element-for-brewing-80cm-diameter-15000w',
          },
        ],
      },
      {
        title: 'Diameter\n (cm)',
        length: 'cm',
        values: [25, 25.5, 30, 30, 35, 35, 35, 40, 50, 60, 80],
      },
      {
        title: 'Length\n (cm)',
        length: 'cm',
        values: [30, 30.5, 35, 35, 40, 40, 40, 45, 56.5, 66, 86.5],
      },
      {
        title: 'Min. kettle\n ⌀ (cm)',
        length: 'cm',
        values: [31, 32, 36, 36, 41, 41, 41, 46, 57.5, 67, 87.5],
      },
      {
        title: 'Designed for\n kettle ⌀ (cm)',
        length: 'cm',
        values: [35, 35, 40, 40, 45, 45, 45, 50, 63, 72, 93],
      },
      {
        title: 'Diameter\n (in)',
        length: 'inch',
        values: [9.8, 10, 11.8, 11.8, 13.8, 13.8, 13.8, 15.7, 19.7, 23.6, 31.5].map((v) => v.toFixed(1)),
      },
      {
        title: 'Length\n (in)',
        length: 'inch',
        values: [11.8, 12, 13.8, 13.8, 15.7, 15.7, 15.7, 17.7, 22.2, 26, 34.1].map((v) => v.toFixed(1)),
      },
      {
        title: 'Min. kettle\n ⌀ (in)',
        length: 'inch',
        values: [12.2, 12.6, 14.2, 14.2, 16.1, 16.1, 16.1, 18.1, 22.6, 26.4, 34.4].map((v) => v.toFixed(1)),
      },
      {
        title: 'Designed for\n kettle ⌀ (in)',
        length: 'inch',
        values: [13.8, 13.8, 15.7, 15.7, 17.7, 17.7, 17.7, 19.7, 24.8, 28.3, 36.6].map((v) => v.toFixed(1)),
      },
      {
        title: 'No.\n Resistors',
        values: [3, 1, 1, 3, 1, 3, 3, 3, 3, 3, 3],
      },
      {
        title: 'Current per\n resistor (A)',
        voltage: '230V',
        values: [8, 12.2, 15.2, 8, 15.2, 12.3, 8, 12.3, 14.5, 14.5, 21.7].map((v) => v.toFixed(1)),
      },
      {
        title: 'Total power\n (W)',
        voltage: '230V',
        values: [5500, 2800, 3500, 5500, 3500, 8500, 5500, 8500, 10000, 10000, 15000],
      },
      {
        title: 'Watt density\n (W/cm²)',
        voltage: '230V',
        values: [6.8, 10.3, 10.7, 5.6, 9.2, 7.5, 4.8, 6.5, 6.1, 5.1, 5.8],
      },
      {
        title: 'Current per\n resistor (A)',
        voltage: '240V',
        values: [8.3, 12.7, 15.9, 8.3, 15.9, 12.9, 8.3, 12.9, 15.1, 15.1, 22.7].map((v) => v.toFixed(1)),
      },
      {
        title: 'Total power\n (W)',
        voltage: '240V',
        values: [6000, 3050, 3800, 6000, 3800, 9250, 6000, 9250, 10900, 10900, 16350],
      },
      {
        title: 'Watt density\n (W/cm²)',
        voltage: '240V',
        values: [7.4, 11.2, 11.7, 6.1, 10, 8.2, 5.2, 7.1, 6.6, 5.6, 6.3].map((v) => v.toFixed(1)),
      },
    ],
  }),
};
</script>

<template>
  <HardwareTableTemplate :columns="values" />
</template>
