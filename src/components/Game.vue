<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import generate from "../data/terrain/generator";
import Surface from "../data/terrain/surface";
import Renderer from "../renderers/emojiRenderer/renderer";
import Manager from "../data/manager";
import TowerMenu from "./TowerMenu.vue";
import GameStats from "./GameStats.vue";

const canvas = ref<HTMLDivElement | null>(null);

const surface = new Surface(400, 400, generate);
const targetTile = surface.getTile(200, 200)!;
const manager = new Manager(targetTile, surface);
const renderer = new Renderer(manager.getSurface(), manager.getController());

let mounted = false;
let oldTimestamp = 0;

onMounted(() => {
  mounted = true;
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
    <GameStats :renderer="renderer" />
    <div class="canvas">
      <div class="render-target" ref="canvas"></div>
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

    .render-target {
      width: 1280px;
      height: 900px;
      overflow: auto;

      -ms-overflow-style: none;
      scrollbar-width: none;
      &::-webkit-scrollbar {
        display: none;
      }
    }
  }
}
</style>
