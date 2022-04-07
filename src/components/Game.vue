<script setup lang="ts">
import { onMounted, ref } from "vue";
import generate from "../data/terrain/generator";
import Surface from "../data/terrain/surface";
import Renderer from "../renderers/emojiRenderer/renderer";
import Base from "../data/entity/base";

// defineProps<{}>();

const canvas = ref<HTMLDivElement | null>(null);

onMounted(() => {
  const surface = new Surface(96, 54, generate);
  const tile = surface.getTile(60, 50)!;
  const base = new Base(tile);
  surface.spawn(base);

  const renderer = new Renderer(surface);
  renderer.mount(canvas.value as HTMLDivElement);

  window.setInterval(() => {
    renderer.rerender();
  }, 10);
});
</script>

<template>
  <div ref="canvas"></div>
</template>

<style scoped></style>
