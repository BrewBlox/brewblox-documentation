<script>
export default {
  name: 'UmlDiagram',
  props: {
    encoded: { type: String, required: true },
    title: { type: String, required: true },
  },
  computed: {
    url() {
      return `https://www.plantuml.com/plantuml/png/${this.encoded}`;
    }
  }
};
</script>

<template>
  <p>
    <img :src="url" :alt="title" :title="title" />
  </p>
</template>
