<script setup lang="ts">
import { onMounted, ref } from "vue";
import generate from "../data/terrain/generator";
import Surface from "../data/terrain/surface";
import Renderer from "../renderers/emojiRenderer/renderer";
import Manager from "../data/manager";
import TowerMenu from "./TowerMenu.vue";

// defineProps<{}>();

const canvas = ref<HTMLDivElement | null>(null);
const isStarted = ref(false);

const surface = new Surface(96, 54, generate);
const spawnTile = surface.getTile(5, 5)!;
const manager = new Manager(
  [spawnTile, spawnTile, spawnTile, spawnTile],
  surface.getTile(60, 50)!,
  surface
);

onMounted(() => {
  const renderer = new Renderer(manager.getSurface(), manager.getController());
  renderer.mount(canvas.value as HTMLDivElement);

  window.setInterval(() => {
    manager.tick(50);

    renderer.rerender(50);
  }, 50);
});

function start() {
  manager.start();
  isStarted.value = manager.getIsStarted();
}
</script>

<template>
  <div class="wrapper">
    <div ref="canvas"></div>
    <TowerMenu :controller="manager.getController()" />
  </div>

  <button @click="start()" :disabled="isStarted">Start wave</button>
</template>

<style scoped>
.wrapper {
  position: relative;
  width: fit-content;
  overflow: hidden;
}
</style>
