<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { GameEvent, StatUpdate } from "../../data/events";
import Manager from "../../data/manager";
import { IRenderer } from "../../renderers/api";
import Stats from "./Stats.vue";

const props = defineProps<{
  renderer: IRenderer;
}>();

const naturalNumberFormatter = Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});
const numberFormatter = Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});
const percentageFormatter = Intl.NumberFormat(undefined, {
  style: "percent",
  maximumFractionDigits: 0,
});

const money = ref(0);
const moneyMultiplier = ref(0);
const level = ref(0);
const remainingEnemies = ref(0);
const inProgress = ref(false);
const integrity = ref(0);
const regeneration = ref(0);
const showCoverage = ref(false);
const power = ref(0);
const lastProduction = ref(0);
const lastConsumption = ref(0);
const expansion = ref(false);

const eventHandler = (stats: StatUpdate) => {
  money.value = stats.money;
  moneyMultiplier.value = stats.moneyMultiplier;
  level.value = stats.level;
  remainingEnemies.value = stats.remainingEnemies;
  inProgress.value = stats.inProgress;
  integrity.value = stats.integrity;
  regeneration.value = stats.regeneration;
  power.value = stats.power;
  lastProduction.value = stats.production;
  lastConsumption.value = stats.consumption;
};

onMounted(() => {
  Manager.Instance.addEventListener(GameEvent.StatUpdate, eventHandler);
  Manager.Instance.triggerStatUpdate();
});

onUnmounted(() => {
  Manager.Instance.removeEventListener(GameEvent.StatUpdate, eventHandler);
});

function start() {
  Manager.Instance.start();
}

function toggleExpand() {
  expansion.value = !expansion.value;
}

function toggleCoverage() {
  showCoverage.value
    ? props.renderer.hideCoverage()
    : props.renderer.showCoverage();

  showCoverage.value = !showCoverage.value;
}
</script>

<template>
  <div class="hud">
    <div class="hud-positioner">
      <Stats :expanded="expansion" />
      <div class="group">
        <button
          :class="{ 'wave-toggle': true, 'wave-toggle--active': !inProgress }"
          @click="start"
        >
          <span class="emoji">⚔️</span>
          <span v-if="!inProgress">Start wave {{ level + 1 }}</span>
          <span v-if="inProgress">Wave {{ level }}</span>
        </button>
        <button
          :class="{ toggle: true, 'toggle-toggled': expansion }"
          @click="toggleExpand"
        >
          🔎
        </button>
        <button
          :class="{ toggle: true, 'toggle-toggled': showCoverage }"
          @click="toggleCoverage"
        >
          🎯
        </button>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.hud {
  height: 32px;
  background-color: rgb(44, 49, 120);
  border-bottom: 2px solid #000;
  box-sizing: border-box;
  z-index: 1;
  position: relative;
  padding: 0 16px;

  &-positioner {
    height: 100px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: start;
    pointer-events: none;
  }

  .group {
    display: flex;
    flex-direction: row;
    align-items: start;
    gap: 16px;
  }

  .toggle,
  .wave-toggle {
    border: 2px solid #000;
    border-top: none;
    background-color: rgb(44, 49, 120);
    padding: 4px;
    width: 41.5px;
    pointer-events: all;
    cursor: pointer;

    &-toggled {
      padding-top: 8px;
      background-color: rgb(59, 77, 152);
    }
  }

  .wave-toggle {
    height: 41.5px;
    width: 140px;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: height 0.2s;

    .emoji {
      font-size: 32px;
      display: none;
    }

    &--active {
      height: 77.5px;
      background-color: rgb(59, 77, 152);

      .emoji {
        display: block;
      }
    }
  }
}
</style>
