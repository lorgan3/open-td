<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { GameEvent, StatUpdate } from "../../data/events";
import Manager from "../../data/manager";

const props = defineProps<{
  expanded: boolean;
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
const power = ref(0);
const lastProduction = ref(0);
const lastConsumption = ref(0);

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

const clazz = computed(() => {
  return {
    stat: true,
    "stat--expanded": props.expanded,
  };
});

onMounted(() => {
  Manager.Instance.addEventListener(GameEvent.StatUpdate, eventHandler);
  Manager.Instance.triggerStatUpdate();
});

onUnmounted(() => {
  Manager.Instance.removeEventListener(GameEvent.StatUpdate, eventHandler);
});
</script>

<template>
  <div class="stats">
    <span :class="clazz">
      🪙 {{ naturalNumberFormatter.format(money) }}
      <span class="meta"
        >(<span class="positive">{{
          percentageFormatter.format(moneyMultiplier)
        }}</span
        >)</span
      >
    </span>
    <span :class="clazz">
      🔋 {{ naturalNumberFormatter.format(power) }}
      <span class="meta"
        >(<span class="positive"
          >+{{ numberFormatter.format(lastProduction) }}</span
        >/<span class="negative"
          >-{{ numberFormatter.format(lastConsumption) }}</span
        >)</span
      >
    </span>
    <span :class="clazz">
      🛡️ {{ naturalNumberFormatter.format(integrity) }}
      <span class="meta"
        >(<span class="positive"
          >+{{ numberFormatter.format(regeneration) }}</span
        >)</span
      >
    </span>
    <span :class="clazz"> 👾 {{ remainingEnemies }} </span>
  </div>
</template>

<style lang="scss" scoped>
.stats {
  display: flex;
  flex-direction: row;
  gap: 16px;
  color: #fff;

  .stat {
    border: 2px solid #000;
    border-top: none;
    background-color: rgb(44, 49, 120);
    padding: 4px;
    overflow: hidden;
    white-space: nowrap;
    width: 80px;
    transition: width 0.2s;
    pointer-events: all;

    .meta {
      opacity: 0;
      transition: opacity 0.2s;
    }

    &:hover,
    &--expanded {
      width: 150px;

      .meta {
        opacity: 1;
      }
    }
  }
}
</style>
