<script>
export default {
  name: 'HardwareTableTemplate',
  props: {
    columns: {
      type: Array,
      default: () => [
        {
          title: '#',
          values: [0, 9],
          // no length / voltage property -> always shown
        },
        {
          title: 'Diameter (cm)',
          values: [1, 2],
          length: 'cm', // Only shown if activeLength === 'cm'
          // No voltage property set -> shown regardless of active voltage
        },
        {
          title: 'Diameter (in)',
          values: [4, 5],
          length: 'inch',
        },
        {
          title: 'Power (W)',
          values: [1, 2],
          voltage: '230V', // Only shown if activeVoltage === '230V'
          // No length property set -> shown regardless of active length
        },
        {
          title: 'Power (W)',
          values: [4, 5],
          voltage: '240V',
        },
      ],
    },
  },
  data: () => ({
    activeLength: 'cm',
    activeVoltage: '230V',
  }),
  computed: {
    tableValues() {
      return this.columns
        .map((c, idx) => ({ ...c, key: `col-${idx}-${c.title}` }))
        .filter((c) => (!c.voltage && !c.length) || c.voltage === this.activeVoltage || c.length === this.activeLength);
    },
    numRows() {
      return Math.max(...this.columns.map((c) => c.values.length));
    },
  },
  methods: {
    toggleLength() {
      this.activeLength = this.activeLength === 'cm' ? 'inch' : 'cm';
    },
    toggleVoltage() {
      this.activeVoltage = this.activeVoltage === '230V' ? '240V' : '230V';
    },
  },
};
</script>

<template>
  <div>
    <div class="table-container">
      <div class="button-prefix">
        Length unit:
      </div>
      <div class="table-button" @click="toggleLength">
        <template v-if="activeLength === 'cm'"> <b>cm</b> / in </template>
        <template v-else> cm / <b>in</b> </template>
      </div>

      <div class="button-prefix">
        Voltage:
      </div>
      <div class="table-button" @click="toggleVoltage">
        <template v-if="activeVoltage === '230V'"> <b>230V</b> / 240V </template>
        <template v-else> 230V / <b>240V</b> </template>
      </div>
    </div>

    <div class="table-container">
      <div v-for="c in tableValues" :key="c.key" class="column table">
        <div>{{ c.title }}</div>
        <div v-for="num in numRows" :key="`${c.key}-value-${num}`">
          {{ c.values[num - 1] }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.table-container {
  display: flex;
  min-width: 100%;
  flex-flow: row nowrap;
  justify-content: flex-start;
  align-items: stretch;
  overflow-x: auto;
}
.column {
  display: flex;
  flex-flow: column nowrap;
  flex: 1 0 auto;
  margin: 0.5em 0;
}
.column:not(:first-child) {
  border-left: 0.1em solid #bbbbbb;
}
.column > div:nth-child(odd) {
  background: #dddddd;
}
.table > div {
  text-align: center;
  font-weight: bold;
  padding: 3px 5px;
  flex: 1 0 0;
}
.table > div:not(:first-child) {
  text-align: right;
  font-weight: normal;
}

.button-prefix {
  padding: 0.2em 0.5em 0.2em 0;
  align-self: center;
}

.table-button {
  padding: 0.2em 1em;
  border: 0.16em solid #bbbbbb;
  margin: 0 0.3em 0.3em 0;
  cursor: pointer;
  text-decoration: none;
  -webkit-user-select: none;
  -moz-user-select: none;
}
.table-button:hover {
  background: #dddddd;
   border-color: #dddddd;
}
.table-button:active {
  background: #bbbbbb;
   border-color: #bbbbbb;
}
</style>
