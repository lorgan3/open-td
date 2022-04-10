<script setup lang="ts">
import { onMounted, ref } from "vue";
import generate from "../data/terrain/generator";
import Surface from "../data/terrain/surface";
import Renderer from "../renderers/emojiRenderer/renderer";
import Manager from "../data/manager";

// defineProps<{}>();

const canvas = ref<HTMLDivElement | null>(null);

onMounted(() => {
  const surface = new Surface(96, 54, generate);
  const spawnTile = surface.getTile(5, 5)!;
  const manager = new Manager(
    [spawnTile, spawnTile, spawnTile, spawnTile],
    surface.getTile(60, 50)!,
    surface
  );

  const renderer = new Renderer(manager.getSurface(), manager.getController());
  renderer.mount(canvas.value as HTMLDivElement);

  window.setInterval(() => {
    manager.tick(50);

    renderer.rerender(50);
  }, 50);
});
</script>

<template>
  <div ref="canvas"></div>
</template>

<style scoped></style>
