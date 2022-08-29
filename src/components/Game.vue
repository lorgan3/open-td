<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import generate from "../data/terrain/generator";
import Surface from "../data/terrain/surface";
import Renderer from "../renderers/emojiRenderer/renderer";
import Manager from "../data/manager";
import TowerMenu from "./TowerMenu.vue";
import GameStats from "./GameStats.vue";
import Controller from "../data/controller";

// @TODO: use the seed
const props = defineProps<{
  seed: string;
}>();

const canvas = ref<HTMLDivElement | null>(null);

const surface = new Surface(300, 300, generate);
const controller = new Controller(surface);
const renderer = new Renderer(surface, controller);

const targetTile = surface.getTile(150, 150)!;
const manager = new Manager(
  targetTile,
  surface,
  controller,
  renderer.showMessage
);

renderer.showMessage("Welcome to Open TD!");

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
    display: flex;

    .render-target {
      max-width: 100vw;
      max-height: calc(100vh - 70px);
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
