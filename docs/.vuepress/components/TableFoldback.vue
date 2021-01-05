<script>
export default {
  name: 'TableFoldback',
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
          values: ['XX', 'XX'],
      });
      if(this.lengthType === 'cm') {
        table.push({
          title: 'Length (cm)',
          onClick: this.toggleLength,
          values: [27, 32],
        },
        {
          title: 'Min. kettle ⌀ (cm)',
          onClick: this.toggleLength,
          values: [30, 30],
        });
      }
      if(this.lengthType === 'inch') {
        table.push({
          title: 'Length (in)',
          onClick: this.toggleLength,
          values: [10.6, 12.6],
        },
        {
          title: 'Min. kettle ⌀ (in)',
          onClick: this.toggleLength,
          values: [11.8, 13.8],
        });
      }
      table.push({
        title: 'No. Resistors',
        onClick: null,
        values: [1, 1],
      });
      if(this.voltageType === '230V') {
        table.push({
          title: 'Current (A)',
          onClick: this.toggleVoltage,
          values: [12.2, 13.9],
        },
        {
          title: 'Power (W)',
          onClick: this.toggleVoltage,
          values: [2800, 3200],
        },
        {
          title: 'Watt density (W/cm²)',
          onClick: this.toggleVoltage,
          values: [11, 11],
        });
      }
      if(this.voltageType === '240V') {
        table.push({
          title: 'Current (A)',
          onClick: this.toggleVoltage,
          values: [12.7, 14.5],
        },
        {
          title: 'Power (W)',
          onClick: this.toggleVoltage,
          values: [3050, 3480],
        },
        {
          title: 'Watt density (W/cm²)',
          onClick: this.toggleVoltage,
          values: [12, 12],
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