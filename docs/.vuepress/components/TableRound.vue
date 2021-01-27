<script>
export default {
  name: 'TableTriclamp',
  data: () => ({
    lengthType: 'cm',
    voltageType: '230V',
  }),
  computed: {
    tableValues() {
      const table = [];
      table.push({
        title: '#',
        onClick: null,
        values: [6, 7, 11, 1, 2, 3, 4, 5, 8, 9, 10],
      });
      if (this.lengthType === 'cm') {
        table.push(
          {
            title: 'Diameter (cm)',
            onClick: this.toggleLength,
            values: [30, 35, 25.5, 35, 40, 50, 60, 80, 25, 30, 35],
          },
          {
            title: 'Length (cm)',
            onClick: this.toggleLength,
            values: [35, 40, 30.5, 40, 45, 56.5, 66, 86.5, 30, 35, 40],
          },
          {
            title: 'Min. kettle ⌀ (cm)',
            onClick: this.toggleLength,
            values: [36, 41, 32, 41, 46, 57.5, 67, 87.5, 31, 36, 41],
          },
          {
            title: 'Designed for kettle ⌀ (cm)',
            onClick: this.toggleLength,
            values: [40, 45, 35, 45, 50, 63, 72, 93, 35, 40, 45],
          }
        );
      }
      if (this.lengthType === 'inch') {
        table.push(
          {
            title: 'Diameter (in)',
            onClick: this.toggleLength,
            values: [11.8, 13.8, '10.0', 13.8, 15.7, 19.7, 23.6, 31.5, 9.8, 11.8, 13.8],
          },
          {
            title: 'Length (in)',
            onClick: this.toggleLength,
            values: [13.8, 15.7, '12.0', 15.7, 17.7, 22.2, '26.0', 34.1, 11.8, 13.8, 15.7],
          },
          {
            title: 'Min. kettle ⌀ (in)',
            onClick: this.toggleLength,
            values: [14.2, 16.1, 12.6, 16.1, 18.1, 22.6, 26.4, 34.4, 12.2, 14.2, 16.1],
          },
          {
            title: 'Designed for kettle ⌀ (in)',
            onClick: this.toggleLength,
            values: [15.7, 17.7, 13.8, 17.7, 19.7, 24.8, 28.3, 36.6, 13.8, 15.7, 17.7],
          }
        );
      }
      table.push({
        title: 'No. Resistors',
        onClick: null,
        values: [1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3],
      });
      if (this.voltageType === '230V') {
        table.push(
          {
            title: 'Current (A)',
            onClick: this.toggleVoltage,
            values: [
              '15.2x1',
              '15.2x1',
              '12.2x1',
              '12.3x3',
              '12.3x3',
              '14.5x3',
              '14.5x3',
              '21.7x3',
              '8.0x3',
              '8.0x3',
              '8.0x3',
            ],
          },
          {
            title: 'Power (W)',
            onClick: this.toggleVoltage,
            values: [3500, 3500, 2800, 8500, 8500, 10000, 10000, 15000, 5500, 5500, 5500],
          },
          {
            title: 'Watt density (W/cm²)',
            onClick: this.toggleVoltage,
            values: [10.7, 9.2, 10.3, 7.5, 6.5, 6.1, 5.1, 5.8, 6.8, 5.6, 4.8],
          }
        );
      }
      if (this.voltageType === '240V') {
        table.push(
          {
            title: 'Current (A)',
            onClick: this.toggleVoltage,
            values: [
              '15.9x1',
              '15.9x1',
              '12.7x1',
              '12.9x3',
              '12.9x3',
              '15.1x3',
              '15.1x3',
              '22.7x3',
              '8.3x3',
              '8.3x3',
              '8.3x3',
            ],
          },
          {
            title: 'Power (W)',
            onClick: this.toggleVoltage,
            values: [3800, 3800, 3050, 9250, 9250, 10900, 10900, 16350, 6000, 6000, 6000],
          },
          {
            title: 'Watt density (W/cm²)',
            onClick: this.toggleVoltage,
            values: [11.7, '10.0', 11.2, 8.2, 7.1, 6.6, 5.6, 6.3, 7.4, 6.1, 5.2],
          }
        );
      }
      return table;
    },
    numRows() {
      return this.tableValues.reduce((max, col) => Math.max(max, col.values.length), 0);
    },
  },
  methods: {
    toggleLength() {
      this.lengthType = this.lengthType === 'cm' ? 'inch' : 'cm';
    },
    toggleVoltage() {
      this.voltageType = this.voltageType === '230V' ? '240V' : '230V';
    },
  },
};
</script>

<template>
  <table>
    <!-- cm / inch headers -->
    <tr>
      <!-- # (BrewPi part No.) -->
      <th />
      <!-- length -->
      <th class="clickable" colspan="4" @click="toggleLength">
        {{ lengthType }}
      </th>
      <!-- no. resistors -->
      <th />
      <!-- voltage -->
      <th class="clickable" colspan="3" @click="toggleVoltage">
        {{ voltageType }}
      </th>
    </tr>
    <!-- column titles -->
    <tr>
      <th v-for="col in tableValues" :key="col.title">
        {{ col.title }}
      </th>
    </tr>
    <!-- column values -->
    <tr v-for="rowNum in numRows" :key="'row-' + rowNum">
      <td style="text-align:right" v-for="(col, colIdx) in tableValues" :key="'col-' + colIdx">
        {{ col.values[rowNum - 1] }}
      </td>
    </tr>
  </table>
</template>

<style>
.clickable {
  cursor: pointer;
}
</style>
