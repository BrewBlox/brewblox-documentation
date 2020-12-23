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
          values: [14, 15, 16, 11, 12, 13],
      });
      if(this.lengthType === 'cm') {
        table.push({
          title: 'Length (cm)',
          onClick: this.toggleLength,
          values: [30, 35, 42,32, 42, 52],
        },
        {
          title: 'Min. kettle ⌀ (cm)',
          onClick: this.toggleLength,
          values: [30, 35, 42, 32, 42, 52],
        });
      }
      if(this.lengthType === 'inch') {
        table.push({
          title: 'Length (in)',
          onClick: this.toggleLength,
          values: [11.8, 13.8, 16.5, 12.6, 16.5, 20.5],
        },
        {
          title: 'Min. kettle ⌀ (in)',
          onClick: this.toggleLength,
          values: [11.8, 13.8, 16.5, 12.6, 16.5, 20.5],
        });
      }
      table.push({
        title: 'No. Resistors',
        onClick: null,
        values: [2, 2, 2, 3, 3, 3],
      });
      if(this.voltageType === '230V') {
        table.push({
          title: 'Current (A)',
          onClick: this.toggleVoltage,
          values: [12.2, 13.9, 21.7, '8.0', 12.3, 14.5],
        },
        {
          title: 'Power (W)',
          onClick: this.toggleVoltage,
          values: [2800, 3200, 5000, 5500, 8500, 10000],
        },
        {
          title: 'Watt density (W/cm²)',
          onClick: this.toggleVoltage,
          values: [8.8, 8.3, 10.3, 10.6, 11.7, 10.7],
        });
      }
      if(this.voltageType === '240V') {
        table.push({
          title: 'Current (A)',
          onClick: this.toggleVoltage,
          values: [12.7, 14.5, 22.7, '25.0', 38.6, 45.4],
        },
        {
          title: 'Power (W)',
          onClick: this.toggleVoltage,
          values: [3050, 3480, 5440, 5590, 9260, 10890],
        },
        {
          title: 'Watt density (W/cm²)',
          onClick: this.toggleVoltage,
          values: [9.6, '9.0', 11.2, 11.5, 12.7, 11.7],
        });
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
      <th
        class="clickable"
        colspan="2"
        @click="toggleLength"
      >
        {{ lengthType }}
      </th>
      <!-- no. resistors -->
      <th />
      <!-- voltage -->
      <th
        class="clickable"
        colspan="3"
        @click="toggleVoltage"
      >
        {{ voltageType }}
      </th>
    </tr>
    <!-- column titles -->
    <tr>
      <th
        v-for="col in tableValues"
        :key="col.title"
      >
        {{ col.title }}
      </th>
    </tr>
    <!-- column values -->
    <tr
      v-for="rowNum in numRows"
      :key="'row-'+rowNum"
    >
      <td
        style="text-align:right"
        v-for="(col, colIdx) in tableValues"
        :key="'col-'+colIdx"
      >
        {{ col.values[rowNum-1] }}
      </td>
    </tr>
  </table>
</template>

<style>
.clickable {
  cursor: pointer;
}
</style>