<template>
<p>
    <img :src="url" :alt="title" :title="title">
</p>
</template>

<script>
const urls = require("../generated/uml-urls");

module.exports = {
  props: {
    src: String,
    title: String
  },
  computed: {
    url: function() {
      return urls[this.src];
    }
  }
};
</script>
