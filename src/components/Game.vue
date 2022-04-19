<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import generate from "../data/terrain/generator";
import Surface from "../data/terrain/surface";
import Renderer from "../renderers/emojiRenderer/renderer";
import Manager from "../data/manager";
import TowerMenu from "./TowerMenu.vue";
import Pathfinder from "../data/terrain/pathfinder";
import GameStats from "./GameStats.vue";

// defineProps<{}>();

const canvas = ref<HTMLDivElement | null>(null);

const surface = new Surface(96, 54, generate);
const pathfinder = new Pathfinder(surface);
const spawnTile = surface.getTile(5, 5)!;
const targetTile = surface.getTile(60, 50)!;
const manager = new Manager(
  [[spawnTile, spawnTile, spawnTile, spawnTile]],
  targetTile,
  surface
);

let mounted = false;
let oldTimestamp = 0;

onMounted(() => {
  mounted = true;
  const renderer = new Renderer(manager.getSurface(), manager.getController());
  renderer.mount(canvas.value as HTMLDivElement);

  const render = (timestamp: number) => {
    const dt = timestamp - oldTimestamp;
    manager.tick(dt);
    renderer.rerender(dt);
    oldTimestamp = timestamp;

    if (mounted) {
      window.requestAnimationFrame(render);
    }
  };

  window.requestAnimationFrame(render);
});

onUnmounted(() => (mounted = false));
</script>

<template>
  <div class="wrapper">
    <GameStats />
    <div class="canvas">
      <div ref="canvas"></div>
      <TowerMenu :controller="manager.getController()" />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  position: relative;
  width: fit-content;
  overflow: hidden;

  .canvas {
    position: relative;
  }
}
</style>
