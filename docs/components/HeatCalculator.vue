<script setup>
import { computed, ref } from 'vue';

const C_P = 4180; // heat capacity water, in J

const volumeL = ref(20);
const startTempC = ref(20);
const endTempC = ref(65);
const powerW = ref(3500);

function round(value, precision = 2) {
  const exp = Math.pow(10, precision);
  return Math.round((value + Number.EPSILON) * exp) / exp;
}

const volumeGal = computed({
  get: () => round(volumeL.value / 3.785),
  set: (v) => (volumeL.value = round(((v - 32) * 5) / 9)),
});

const startTempF = computed({
  get: () => round((startTempC.value * 9) / 5 + 32),
  set: (v) => (startTempC.value = round(((v - 32) * 5) / 9)),
});

const endTempF = computed({
  get: () => round((endTempC.value * 9) / 5 + 32),
  set: (v) => (endTempC.value = round(((v - 32) * 5) / 9)),
});

const deltaTempC = computed(() => endTempC.value - startTempC.value);
const deltaTempF = computed(() => endTempF.value - startTempF.value);

const deltaT = computed(() =>
  ((C_P * volumeL.value * deltaTempC.value) / (powerW.value * 60)).toFixed(0),
);
</script>

<template>
  <div class="calc-root">
    <div class="input-fields">
      <div class="input-col">
        <div class="head">
          <div>Metric</div>
        </div>
        <div class="field">
          <label>Volume (L)</label>
          <input
            v-model="volumeL"
            inputmode="decimal"
          />
        </div>
        <div class="field">
          <label>Start Temp (&deg;C)</label>
          <input
            v-model="startTempC"
            inputmode="decimal"
          />
        </div>
        <div class="field">
          <label>End Temp (&deg;C)</label>
          <input
            v-model="endTempC"
            inputmode="decimal"
          />
        </div>
        <div class="field">
          <label>Power (W)</label>
          <input
            v-model="powerW"
            inputmode="decimal"
          />
        </div>
      </div>
      <div class="input-col">
        <div class="head">
          <div>US</div>
        </div>
        <div class="field">
          <label>Volume (Gal)</label>
          <input
            v-model="volumeGal"
            inputmode="decimal"
          />
        </div>
        <div class="field">
          <label>Start Temp (&deg;F)</label>
          <input
            v-model="startTempF"
            inputmode="decimal"
          />
        </div>
        <div class="field">
          <label>End Temp (&deg;F)</label>
          <input
            v-model="endTempF"
            inputmode="decimal"
          />
        </div>
        <div class="field">
          <label>Power (W)</label>
          <input
            v-model="powerW"
            inputmode="decimal"
          />
        </div>
      </div>
    </div>

    <div class="calc-fields">
      <div>Heating time</div>
      <div>=</div>
      <div>{{ deltaT }} min</div>
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
.head {
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-x: auto;
  font-weight: bolder;
  font-size: 1.2rem;
  margin-bottom: 10px;
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
  margin-top: 10px;
  margin-bottom: 20px;
}
.calc-fields > div {
  margin: 0 5px 5px 5px;
}
</style>
