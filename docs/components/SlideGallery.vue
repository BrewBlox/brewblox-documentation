<script setup>
import ClientOnly from '@duannx/vue-client-only';
import { ref } from 'vue';
import { Carousel, Navigation, Slide } from 'vue3-carousel';
import 'vue3-carousel/dist/carousel.css';

defineProps({
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
});

const index = ref(null);
</script>

<template>
  <div>
    <client-only>
      <carousel>
        <slide
          v-for="(image, i) in images"
          :key="i"
        >
          <img
            :src="image"
            class="image"
          />
        </slide>

        <template #addons>
          <navigation v-if="images.length > 1" />
        </template>
      </carousel>
    </client-only>
  </div>
</template>
