<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { GameEvent, StatUpdate } from "../data/events";
import Manager from "../data/manager";
import { IRenderer } from "../renderers/api";

const props = defineProps<{
  renderer: IRenderer;
}>();

const naturalNumberFormatter = Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});
const numberFormatter = Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

const money = ref(0);
const level = ref(0);
const remainingEnemies = ref(0);
const inProgress = ref(false);
const integrity = ref(0);
const regeneration = ref(0);
const showCoverage = ref(false);
const power = ref(0);
const lastProduction = ref(0);
const lastConsumption = ref(0);

const eventHandler = (stats: StatUpdate) => {
  money.value = stats.money;
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

function toggleCoverage() {
  showCoverage.value
    ? props.renderer.hideCoverage()
    : props.renderer.showCoverage();

  showCoverage.value = !showCoverage.value;
}
</script>

<template>
  <div class="top-bar">
    <ul class="stats">
      <li>
        <span>🪙 {{ money }}</span>
        <span
          >🔋 {{ power }} (<span class="positive">+{{ lastProduction }}</span
          >/<span class="negative">-{{ lastConsumption }}</span
          >)</span
        >
      </li>
      <li>
        <span>Wave {{ level }}</span>
        <span class="buttons">
          <button @click="start()" :disabled="inProgress">Start wave</button>
          <button @click="toggleCoverage()">
            {{ showCoverage ? "Hide coverage" : "Show coverage" }}
          </button>
        </span>
      </li>
      <li>
        <span
          >🛡️ {{ naturalNumberFormatter.format(integrity) }} (<span
            class="positive"
            >+{{ numberFormatter.format(regeneration) }}</span
          >)</span
        >
        <span>👾 {{ remainingEnemies }}</span>
      </li>
    </ul>
  </div>
</template>

<style lang="scss" scoped>
.top-bar {
  .stats {
    display: flex;
    justify-content: space-between;
    padding: 12px;
    border: 2px solid #66f;

    .positive {
      color: green;
    }

    .negative {
      color: red;
    }

    li {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      &:first-of-type {
        align-items: flex-start;
      }

      &:last-of-type {
        align-items: flex-end;
      }
    }

    .buttons {
      display: flex;
      gap: 6px;
    }
  }
}
</style>
