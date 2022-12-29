<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import getGenerator from "../data/terrain/generator";
import Surface from "../data/terrain/surface";
import Controller, { Keys } from "../data/controllers/controller";
import TutorialManager from "../data/tutorial/tutorialManager";
import Marketplace from "./marketplace/Marketplace.vue";
import Hud from "./hud/Hud.vue";
import { Difficulty } from "../data/difficulty";
import { Constructor } from "../renderers/api";
import { init } from "../data/controllers";
import EventSystem from "../data/eventSystem";
import UnlocksController from "../data/controllers/unlocksController";

const props = defineProps<{
  seed: string;
  difficulty: Difficulty;
  renderer: Constructor;
  showTutorial: boolean;
}>();

const canvas = ref<HTMLDivElement | null>(null);

const surface = new Surface({
  width: 200,
  height: 200,
  generate: getGenerator(props.seed, 200, 200),
});
const controller = new Controller(surface);
const renderer = new props.renderer(surface, controller);

const targetTile = surface.getTile(100, 100)!;
const manager = init(
  props.difficulty,
  targetTile,
  surface,
  renderer.showMessage
);

if (props.showTutorial) {
  const tutorialManager = new TutorialManager();
  tutorialManager.start();
}

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
          <stop offset="0%" stop-color="red" stop-opacity="0" />
          <stop offset="95%" stop-color="red" stop-opacity="0" />
          <stop offset="100%" stop-color="red" stop-opacity="0.8" />
        </radialGradient>
      </defs>
    </svg>

    <Hud :renderer="renderer" :controller="Controller.Instance" />
    <div class="canvas">
      <div class="render-target" ref="canvas"></div>
      <Marketplace
        :controller="Controller.Instance"
        :unlocksController="UnlocksController.Instance"
        :eventSystem="EventSystem.Instance"
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

@keyframes blinker {
  to {
    opacity: 0;
  }
}

.alert {
  animation: blinker 0.6s cubic-bezier(1, 0, 0, 1) infinite alternate;
}
</style>
