<script>
import VueGallerySlideshow from 'vue-gallery-slideshow';

export default {
  name: 'Gallery',
  components: {
    VueGallerySlideshow,
  },
  props: {
    images: {
      type: Array,
      default: () => [
      'https://placekitten.com/801/800',
      'https://placekitten.com/802/800',
      'https://placekitten.com/803/800',
      'https://placekitten.com/804/800',
      'https://placekitten.com/805/800',
      'https://placekitten.com/806/800',
      'https://placekitten.com/807/800',
      ],
    },
  },
  data: () => ({
      index: null,
  }),
};
</script>

<template>
  <div>
    <img
      v-for="(image, i) in images"
      :key="i"
      class="image"
      :src="image"
      @click="index = i"
    >
    <vue-gallery-slideshow
      :images="images"
      :index="index"
      @close="index = null"
    />
  </div>
</template>

<style scoped>
.image {
  width: 100px;
  height: 100px;
  background-size: cover;
  cursor: pointer;
  margin: 5px;
  border-radius: 3px;
  border: 1px solid lightgray;
  object-fit: contain;
}
</style>
