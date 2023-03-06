<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import getGenerator from "../data/terrain/generator";
import Surface from "../data/terrain/surface";
import Controller, { Key } from "../data/controllers/controller";
import TutorialManager from "../data/tutorial/tutorialManager";
import Marketplace from "./marketplace/Shop.vue";
import IngameMenu from "./hud/IngameMenu.vue";
import Hud from "./hud/Hud.vue";
import { Difficulty } from "../data/difficulty";
import { Constructor, IRenderer } from "../renderers/api";
import { init } from "../data/controllers";
import EventSystem from "../data/eventSystem";
import UnlocksController from "../data/controllers/unlocksController";
import { GameEvent } from "../data/events";
import PixiRenderer from "../renderers/pixiRenderer/renderer";
import AchievementController from "../data/controllers/achievementController";

const props = defineProps<{
  seed: string;
  difficulty: Difficulty;
  renderer: Constructor;
  showTutorial: boolean;
  mainMenu: () => void;
}>();

const canvas = ref<HTMLDivElement | null>(null);
const isMenuVisible = ref(false);
const isMarketplaceVisible = ref(false);

const surface = new Surface({
  width: 160,
  height: 160,
  generate: getGenerator(props.seed, 160, 160),
});
const controller = new Controller(surface);
let renderer = new props.renderer(surface, controller);

const targetTile = surface.getTile(80, 80)!;
const manager = init(
  props.difficulty,
  targetTile,
  surface,
  renderer.showMessage
);

const tutorialManager = new TutorialManager();
if (props.showTutorial) {
  tutorialManager.start();
}

let mounted = false;
let oldTimestamp: number | undefined;
let removeKeyListener: () => void;
let removeOpenMenuEventListener: () => void;
let removeCloseMenuEventListener: () => void;

onMounted(() => {
  mounted = true;
  renderer.mount(canvas.value as HTMLDivElement);

  removeKeyListener = controller.addKeyListener(Key.Escape, () => {
    if (isMarketplaceVisible.value) {
      Controller.Instance.toggleBuildMenu();
      return;
    }

    isMenuVisible.value = !isMenuVisible.value;

    if (isMenuVisible.value) {
      controller.pause();
    } else {
      controller.unpause();
    }
  });

  removeOpenMenuEventListener = EventSystem.Instance.addEventListener(
    GameEvent.OpenBuildMenu,
    () => (isMarketplaceVisible.value = true)
  );

  removeCloseMenuEventListener = EventSystem.Instance.addEventListener(
    GameEvent.CloseBuildMenu,
    () => (isMarketplaceVisible.value = false)
  );

  const render = (timestamp: number) => {
    if (!mounted) {
      return;
    }

    const x =
      +controller.isKeyDown(Key.Right)! +
      +controller.isKeyDown(Key.D)! -
      +controller.isKeyDown(Key.Left)! -
      +controller.isKeyDown(Key.A)! -
      +controller.isKeyDown(Key.Q)!;
    const y =
      +controller.isKeyDown(Key.Down)! +
      +controller.isKeyDown(Key.S)! -
      +controller.isKeyDown(Key.Up)! -
      +controller.isKeyDown(Key.W)! -
      +controller.isKeyDown(Key.Z)!;

    const zoom =
      +controller.isKeyDown(Key.Plus)! +
      +controller.isKeyDown(Key.Equals)! -
      +controller.isKeyDown(Key.Minus)!;

    if (x || y || zoom) {
      renderer.move({ x, y, zoom });
    }

    const dt = oldTimestamp ? timestamp - oldTimestamp : 16;
    if (!isMenuVisible.value) {
      manager.tick(dt);
    }
    renderer.rerender(dt);
    oldTimestamp = timestamp;

    window.requestAnimationFrame(render);
  };

  window.requestAnimationFrame(render);
});

onUnmounted(() => {
  renderer.unmount();
  AchievementController.Instance.unRegister();

  removeKeyListener();
  removeOpenMenuEventListener();
  removeCloseMenuEventListener();
  mounted = false;
});

const resume = (newRenderer?: Constructor, showTutorial?: boolean) => {
  if (newRenderer && !(renderer instanceof newRenderer)) {
    (renderer as IRenderer).unmount();

    surface.forceRerender();
    renderer = new newRenderer(surface, controller);
    renderer.mount(canvas.value as HTMLDivElement);
    manager.update(renderer.showMessage);
  } else if (renderer instanceof PixiRenderer) {
    renderer.updateSettings();
  }

  if (!tutorialManager.isStarted && showTutorial) {
    tutorialManager.start();
  }

  if (tutorialManager.isStarted && showTutorial === false) {
    tutorialManager.stop();
  }

  isMenuVisible.value = false;
  controller.unpause();
};

const returnToMainMenu = () => {
  AchievementController.Instance.unRegister();
  props.mainMenu();
};
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
        :visible="isMarketplaceVisible"
      />
      <IngameMenu
        :mainMenu="returnToMainMenu"
        :visible="isMenuVisible"
        :resume="resume"
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
