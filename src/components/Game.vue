<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import getGenerator from "../data/terrain/generator";
import Surface from "../data/terrain/surface";
import Renderer from "../renderers/emojiRenderer/renderer";
import Manager, { Difficulty } from "../data/manager";
import Controller, { Keys } from "../data/controller";
import TutorialManager from "../data/tutorial/tutorialManager";
import Marketplace from "./marketplace/Marketplace.vue";
import Hud from "./hud/Hud.vue";

const props = defineProps<{
  seed: string;
  difficulty: Difficulty;
}>();

const canvas = ref<HTMLDivElement | null>(null);

const surface = new Surface(300, 300, getGenerator(props.seed));
const controller = new Controller(surface);
const renderer = new Renderer(surface, controller);

const targetTile = surface.getTile(150, 150)!;
const manager = new Manager(
  props.difficulty,
  targetTile,
  surface,
  controller,
  renderer.showMessage
);

const tutorialManager = new TutorialManager();
tutorialManager.start();

let mounted = false;
let oldTimestamp = 0;

onMounted(() => {
  mounted = true;
  renderer.mount(canvas.value as HTMLDivElement);

  const render = (timestamp: number) => {
    const x =
      +controller.isKeyDown(Keys.Right)! +
      +controller.isKeyDown(Keys.D)! -
      +controller.isKeyDown(Keys.Left)! -
      +controller.isKeyDown(Keys.A)! -
      +controller.isKeyDown(Keys.Q)!;
    const y =
      +controller.isKeyDown(Keys.Down)! +
      +controller.isKeyDown(Keys.S)! -
      +controller.isKeyDown(Keys.Up)! -
      +controller.isKeyDown(Keys.W)! -
      +controller.isKeyDown(Keys.Z)!;

    const zoom =
      +controller.isKeyDown(Keys.Plus)! +
      +controller.isKeyDown(Keys.Equals)! -
      +controller.isKeyDown(Keys.Minus)!;

    if (x || y || zoom) {
      renderer.move({ x, y, zoom });
    }

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
    <svg height="0" style="position: absolute">
      <defs>
        <radialGradient id="alert">
          <stop offset="90%" stop-color="red" stop-opacity="0.8" />
          <stop offset="95%" stop-color="red" stop-opacity="0.8" />
          <stop offset="100%" stop-color="red" stop-opacity="0" />
        </radialGradient>
      </defs>
    </svg>

    <Hud :renderer="renderer" :controller="manager.getController()" />
    <div class="canvas">
      <div class="render-target" ref="canvas"></div>
      <Marketplace
        :controller="manager.getController()"
        :unlocksController="manager.getUnlocksController()"
        :manager="manager"
      />
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
      max-height: calc(100vh - 32px);
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

<style lang="scss">
.scrollable {
  position: relative;

  overflow: auto;
  width: 100%;
  height: 100%;

  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}
</style>
