<script setup lang="ts">
import { onMounted, ref } from "vue";
import generate from "../data/terrain/generator";
import Surface from "../data/terrain/surface";
import Renderer from "../renderers/emojiRenderer/renderer";

// defineProps<{}>();

const canvas = ref<HTMLDivElement | null>(null);

onMounted(() => {
  const surface = new Surface(96, 54, generate);

  const renderer = new Renderer();
  renderer.render(canvas.value as HTMLDivElement, surface);
});
</script>

<template>
  <div ref="canvas"></div>
</template>

<style scoped></style>
