<template>
  <h1 class="ios-result">
    ========== iOS: {{ isIOS }} ==========
  </h1>
</template>

<script>
export default {
  name: 'IOSChecker',
  computed: {
    isIOS () {
      return /iPad|iPhone|iPod/.test(navigator.platform)
        || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    },
  },
};
</script>

<style scoped>
.ios-result {
  text-align: center;
}
</style>
