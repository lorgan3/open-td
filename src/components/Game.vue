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
import { deserialize, init } from "../data/controllers";
import EventSystem from "../data/eventSystem";
import UnlocksController from "../data/controllers/unlocksController";
import { GameEvent } from "../data/events";
import PixiRenderer from "../renderers/pixiRenderer/renderer";
import AchievementController from "../data/controllers/achievementController";
import { get, remove } from "../util/localStorage";
import DefaultManager from "../data/controllers/defaultManager";
import Manager from "../data/controllers/manager";

const props = defineProps<{
  seed: string | null;
  difficulty: Difficulty;
  renderer: Constructor;
  showTutorial: boolean;
  initialSpeed: number;
  mainMenu: () => void;
}>();

const canvas = ref<HTMLDivElement | null>(null);
const isMenuVisible = ref(false);
const isMarketplaceVisible = ref(false);
const simulationSpeed = ref(props.initialSpeed);

const controller = new Controller();
let renderer = new props.renderer(controller);
let manager: DefaultManager;
let surface: Surface;

if (props.seed) {
  console.log(`Seed: ${props.seed}`);

  surface = new Surface({
    width: 160,
    height: 160,
    generate: getGenerator(props.seed, 160, 160),
  });

  const targetTile = surface.getTile(80, 80)!;
  manager = init(props.difficulty, targetTile, surface, renderer.showMessage);
} else {
  console.log("Loading save");

  manager = deserialize(renderer.showMessage, get("save")!);
  surface = manager.getSurface();
}

const tutorialManager = new TutorialManager();
if (props.showTutorial) {
  tutorialManager.start();
}

let mounted = false;
let oldTimestamp: number | undefined;
let removeKeyListener: () => void;
let removeOpenMenuEventListener: () => void;
let removeCloseMenuEventListener: () => void;

const toggleMenu = () => {
  isMenuVisible.value = !isMenuVisible.value;

  if (isMenuVisible.value) {
    controller.pause();
  } else {
    controller.unpause();
  }
};

onMounted(() => {
  mounted = true;
  controller.initialize(surface);
  renderer.mount(surface, canvas.value as HTMLDivElement);

  removeKeyListener = controller.addKeyListener(Key.Escape, () => {
    if (isMarketplaceVisible.value) {
      Controller.Instance.toggleBuildMenu();
      return;
    }

    toggleMenu();
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
      manager.tick(dt * simulationSpeed.value);
    }
    renderer.rerender(dt);
    oldTimestamp = timestamp;

    window.requestAnimationFrame(render);
  };

  window.requestAnimationFrame(render);
});

onUnmounted(() => {
  renderer.unmount();
  AchievementController.Instance?.unRegister();

  removeKeyListener();
  removeOpenMenuEventListener();
  removeCloseMenuEventListener();
  mounted = false;

  if (Manager.Instance.getBase().isDestroyed()) {
    remove("save");
  }
});

const resume = (
  newRenderer?: Constructor,
  showTutorial?: boolean,
  newSpeed?: number
) => {
  if (newRenderer && !(renderer instanceof newRenderer)) {
    (renderer as IRenderer).unmount();

    surface.forceRerender();
    renderer = new newRenderer(controller);
    renderer.mount(surface, canvas.value as HTMLDivElement);
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

  if (newSpeed) {
    simulationSpeed.value = newSpeed;
  }

  isMenuVisible.value = false;
  controller.unpause();
};

const restart = () => {
  manager = deserialize(renderer.showMessage, get("save")!);
  surface = manager.getSurface();

  controller.initialize(surface);
  renderer.unmount();
  renderer.mount(surface, canvas.value as HTMLDivElement);
};

const returnToMainMenu = () => {
  AchievementController.Instance?.unRegister();
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

    <Hud
      :renderer="renderer"
      :controller="Controller.Instance"
      :restart="restart"
      :toggleMenu="toggleMenu"
    />
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
      max-height: 100vh;
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
  touch-action: pinch-zoom;
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
