<script>
const C_P = 4180; // heat capacity water, in J

export default {
  name: 'HeatCalculator',
  data: () => ({
    volumeL: 20,
    startTempC: 20,
    endTempC: 65,
    powerW: 3500,
  }),
  computed: {
    volumeGal: {
      get () {
        return this.round(this.volumeL / 3.785);
      },
      set (v) {
        this.volumeL = this.round(v * 3.785);
      },
    },
    startTempF: {
      get () {
        return this.round((this.startTempC * 9/5) + 32);
      },
      set (v) {
        this.startTempC = this.round((v - 32) * 5/9);
      },
    },
    endTempF: {
      get () {
        return this.round((this.endTempC * 9/5) + 32);
      },
      set (v) {
        this.endTempC = this.round((v - 32) * 5/9);
      },
    },
    deltaTempC () {
      return this.endTempC - this.startTempC;
    },
    deltaTempF () {
      return this.round(this.deltaTempC * 9/5);
    },
    deltaT () {
      return (C_P * this.volumeL * this.deltaTempC / (this.powerW * 60)).toFixed(0);
    },
  },
  methods: {
    round(value, precision = 2) {
      const exp = Math.pow(10, precision);
      return Math.round((value + Number.EPSILON) * exp) / exp;
    },
  },
};
</script>

<template>
  <div class="calc-root">
    <div class="input-fields">
      <div class="input-col">
        <div class="field">
          <label>Volume (L)</label>
          <input v-model="volumeL" inputmode="decimal">
        </div>
        <div class="field">
          <label>Start Temp (&deg;C)</label>
          <input v-model="startTempC" inputmode="decimal">
        </div>
        <div class="field">
          <label>End Temp (&deg;C)</label>
          <input v-model="endTempC" inputmode="decimal">
        </div>
        <div class="field">
          <label>Power (W)</label>
          <input v-model="powerW" inputmode="decimal">
        </div>
      </div>
      <div class="input-col">
        <div class="field">
          <label>Volume (Gal)</label>
          <input v-model="volumeGal" inputmode="decimal">
        </div>
        <div class="field">
          <label>Start Temp (&deg;F)</label>
          <input v-model="startTempF" inputmode="decimal">
        </div>
        <div class="field">
          <label>End Temp (&deg;F)</label>
          <input v-model="endTempF" inputmode="decimal">
        </div>
        <div class="field">
          <label>Power (W)</label>
          <input v-model="powerW" inputmode="decimal">
        </div>
      </div>
    </div>

    <div class="calc-fields">
      <div>Time to heat</div>
      <div>
        =
      </div>
      <div>4.18 kJ</div>
      <div>*</div>
      <div>{{ volumeL }} L</div>
      <div>*</div>
      <div>{{ deltaTempC }} &deg;C</div>
      <div>/</div>
      <div>(</div>
      <div>{{ powerW }} W</div>
      <div>
        *
      </div>
      <div>
        60
      </div>
      <div>)</div>
      <div>
        =
      </div>
      <div>
        {{ deltaT }} min
      </div>
    </div>
  </div>
</template>

<style scoped>
.calc-root {
  position: relative;
}
.input-fields {
  display: flex;
  flex-flow: row wrap;
  justify-content: space-around;
}
.input-col {
  min-width: 300px;
  margin-bottom: 20px;
}
.field {
  display: flex;
  flex-flow: row nowrap;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 5px;
}
.field > * {
  margin-inline: 5px;
}
.calc-fields {
  display: flex;
  min-width: 100%;
  flex-flow: row wrap;
  justify-content: center;
  align-items: center;
  overflow-x: auto;
  font-weight: bolder;
  font-size: 1.2rem;
  margin-top: 30px;
  margin-bottom: 30px;
}
.calc-fields > div {
  margin: 0 5px 5px 5px;
}
</style>
