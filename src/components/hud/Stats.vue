<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { GameEvent, StatUpdate } from "../../data/events";
import Manager from "../../data/controllers/manager";
import EventSystem from "../../data/eventSystem";
import UiElement from "./UiElement.vue";

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
const towers = ref(0);
const maxTowers = ref(0);
const inProgress = ref(false);
const integrity = ref(0);
const regeneration = ref(0);
const power = ref(0);
const lastProduction = ref(0);
const lastConsumption = ref(0);

const expansion = ref(true);
function toggleExpand() {
  expansion.value = !expansion.value;
}

const eventHandler = (stats: StatUpdate) => {
  money.value = stats.money;
  moneyMultiplier.value = stats.moneyMultiplier;
  level.value = stats.level;
  towers.value = stats.towers;
  maxTowers.value = stats.maxTowers;
  inProgress.value = stats.inProgress;
  integrity.value = stats.integrity;
  regeneration.value = stats.regeneration;
  power.value = stats.power;
  lastProduction.value = stats.production;
  lastConsumption.value = stats.consumption;
};

const clazz = computed(() => {
  return {
    stats: true,
    "stats--collapsed": !expansion.value,
  };
});

onMounted(() => {
  EventSystem.Instance.addEventListener(GameEvent.StatUpdate, eventHandler);
  Manager.Instance.triggerStatUpdate();
});

onUnmounted(() => {
  EventSystem.Instance.removeEventListener(GameEvent.StatUpdate, eventHandler);
});
</script>

<template>
  <div :class="clazz">
    <UiElement @click="toggleExpand" :class-name="{ circle: true }">
      🪙 {{ naturalNumberFormatter.format(money) }}
      <span class="meta"
        >(<span class="positive">{{
          percentageFormatter.format(moneyMultiplier)
        }}</span
        >)</span
      >
    </UiElement>

    <UiElement :class-name="{ 'minor-stat': true }" style="--i: 145deg">
      🔋 {{ naturalNumberFormatter.format(power) }}
      <span class="meta"
        >(<span class="positive"
          >+{{ numberFormatter.format(lastProduction) }}</span
        >/<span class="negative"
          >-{{ numberFormatter.format(lastConsumption) }}</span
        >)</span
      >
    </UiElement>

    <UiElement :class-name="{ 'minor-stat': true }" style="--i: 90deg">
      🛡️ {{ naturalNumberFormatter.format(integrity) }}
      <span class="meta"
        >(<span class="positive"
          >+{{ numberFormatter.format(regeneration) }}</span
        >)</span
      >
    </UiElement>

    <UiElement :class-name="{ 'minor-stat': true }" style="--i: 35deg">
      🗼 <span v-if="towers > maxTowers" class="negative">{{ towers }}</span
      ><span v-else>{{ towers }}</span> / {{ maxTowers }}
    </UiElement>
  </div>
</template>

<style lang="scss" scoped>
.circle {
  flex-direction: column;
  border-radius: 50%;
  width: 5rem;
  height: 5rem;
  transform: translate(0rem, 0rem) scale(1);
  transition: transform 0.5s;
}

.minor-stat {
  position: absolute;
  top: 1.5rem;
  left: 2.5rem;
  transform: translate(
      calc(3.5rem * sin(var(--i))),
      calc(3.5rem * cos(var(--i)))
    )
    scale(1);
  white-space: nowrap;
  z-index: -1;
  transform-origin: 0% 50%;
  transition: transform 0.5s;
}

.stats {
  position: fixed;
  top: 2rem;
  left: 1rem;
  font-size: 1.8rem;
  z-index: 1;
  color: #fff;

  &--collapsed {
    .circle {
      transform: translate(0rem, -2rem) scale(0.5);
    }

    .minor-stat {
      transform: translate(0rem, -2rem) scale(0);
    }
  }

  .meta {
    font-size: 1.1rem;
    line-height: 0.5;
  }

  .positive {
    color: rgb(138, 220, 138);
  }

  .negative {
    color: rgb(215, 135, 135);
  }
}
</style>
