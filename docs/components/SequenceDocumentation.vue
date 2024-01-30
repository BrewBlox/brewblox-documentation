<script setup>
import { instructions } from 'brewblox-proto/docs/Sequence.json';
</script>

<template>
  <div>
    <div
      v-for="instruction in instructions"
      :key="instruction.name"
    >
      <h3>{{ instruction.name }}</h3>
      <p v-html="instruction.desc" />

      <h5>Arguments</h5>
      <ul v-if="instruction.arguments.length">
        <li
          v-for="arg in instruction.arguments"
          :key="`${instruction.name}-arg-${arg.name}`"
        >
          <code>{{ arg.name }}</code>
          <span
            style="margin-left: 3px; margin-right: 3px; font-weight: lighter"
          >
            [{{ arg.type }}]
          </span>
          <span v-html="arg.desc" />
        </li>
      </ul>
      <p v-else>N/A</p>

      <h5>Errors</h5>
      <ul v-if="instruction.errors.length">
        <li
          v-for="err in instruction.errors"
          :key="`${instruction.name}-error-${err}`"
        >
          <code>{{ err }}</code>
        </li>
      </ul>
      <p v-else>N/A</p>

      <h5>Example</h5>
      <div
        v-for="(ex, idx) in instruction.example"
        :key="`${instruction.name}-example-${idx}`"
        style="margin-bottom: 8px"
      >
        <code>
          {{ ex }}
        </code>
        <br />
      </div>

      <br />
    </div>
  </div>
</template>
