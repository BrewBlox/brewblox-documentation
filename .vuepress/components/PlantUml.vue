<template>
<p>
    <img :src="url" :alt="title" :title="title">
</p>
</template>

<script>
const plantumlEncoder = require("plantuml-encoder");

// TODO(Bob): generate urls for all plantuml diagrams at compile time
// This avoids having to read the file every time the page is loaded

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
