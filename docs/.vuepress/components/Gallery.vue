<script>
import VueGallerySlideshow from 'vue-gallery-slideshow';
import NoSSR from 'vue-no-ssr';

export default {
  name: 'Gallery',
  components: {
    VueGallerySlideshow,
    'no-ssr': NoSSR,
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
    thumbSize: {
      type: String,
      default: '100px',
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
      :style="{width: thumbSize, height: thumbSize}"
      @click="index = i"
    >
    <no-ssr>
      <vue-gallery-slideshow
        :images="images"
        :index="index"
        @close="index = null"
      />
    </no-ssr>
  </div>
</template>

<style scoped>
.image {
  background-size: cover;
  cursor: pointer;
  margin: 5px;
  border-radius: 3px;
  border: 1px solid lightgray;
  object-fit: contain;
}
</style>
