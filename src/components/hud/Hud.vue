<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import Controller from "../../data/controllers/controller";
import { Difficulty } from "../../data/difficulty";
import { GameEvent, StatUpdate } from "../../data/events";
import Manager from "../../data/controllers/manager";
import { IRenderer } from "../../renderers/api";
import Stats from "./Stats.vue";
import EventSystem from "../../data/eventSystem";
import UiElement from "./UiElement.vue";
import Icon from "./Icon.vue";
import { IconType } from "./constants";

const props = defineProps<{
  renderer: IRenderer;
  controller: Controller;
  restart: () => void;
  toggleMenu: () => void;
}>();

const level = ref(0);
const inProgress = ref(false);
const showCoverage = ref(false);
const integrity = ref(0);
const canStart = ref(false);

const eventHandler = (stats: StatUpdate) => {
  level.value = stats.level;
  inProgress.value = stats.inProgress && stats.integrity > 0;
  integrity.value = stats.integrity;
  canStart.value = stats.towers <= stats.maxTowers;
};

onMounted(() => {
  EventSystem.Instance.addEventListener(GameEvent.StatUpdate, eventHandler);
  Manager.Instance.triggerStatUpdate();
});

onUnmounted(() => {
  EventSystem.Instance.removeEventListener(GameEvent.StatUpdate, eventHandler);
});

function start() {
  if (integrity.value > 0) {
    Manager.Instance.start();
  } else {
    props.restart();
  }
}

function toggleCoverage() {
  showCoverage.value
    ? props.renderer.hideCoverage()
    : props.renderer.showCoverage();

  EventSystem.Instance.triggerEvent(GameEvent.ToggleShowCoverage);

  showCoverage.value = !showCoverage.value;
}
</script>

<template>
  <div class="hud">
    <Stats />
    <div class="group">
      <UiElement @click="start" :active="inProgress || !canStart">
        <Icon v-if="canStart" :type="IconType.Battle" />
        <Icon v-else :type="IconType.Lock" />

        <span class="wave-text" v-if="!inProgress && integrity > 0"
          >Start wave {{ level + 1 }}</span
        >
        <span class="wave-text" v-else-if="!inProgress && integrity <= 0"
          >Restart wave {{ level }}</span
        >
        <span class="wave-text" v-else>Wave {{ level }}</span>
      </UiElement>
      <div class="sub-buttons">
        <UiElement
          @click="() => props.controller.toggleBuildMenu()"
          :class-name="{ circle: true }"
          ><Icon :type="IconType.Hammer"
        /></UiElement>
        <UiElement
          v-if="Manager.Instance.getDifficulty() !== Difficulty.Hard"
          @click="toggleCoverage"
          :active="showCoverage"
          :class-name="{ circle: true }"
          ><Icon :type="IconType.Radar"
        /></UiElement>
        <UiElement @click="props.toggleMenu" :class-name="{ circle: true }"
          ><Icon :type="IconType.Gear"
        /></UiElement>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.circle {
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  padding: 0;
}

.hud {
  pointer-events: none;

  .group {
    position: fixed;
    top: 0.4rem;
    right: 0.5rem;
    font-size: 1.5rem;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 0.3rem;

    .sub-buttons {
      display: flex;
      justify-content: space-around;
    }
  }
}
</style>
