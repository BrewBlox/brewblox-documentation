<template>
<p>
    <img :src="url" :alt="title" :title="title">
</p>
</template>

<script>
const plantumlEncoder = require("plantuml-encoder");

module.exports = {
  props: {
    src: String,
    title: String
  },
  computed: {
    url: function() {
      if (!this.src) {
        return "";
      }

      const sourceFile = require("../../" + this.src);
      const encoded = plantumlEncoder.encode(sourceFile);
      return "http://www.plantuml.com/plantuml/png/" + encoded;
    }
  }
};
</script>
