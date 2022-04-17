<script setup lang="ts">
import { onMounted, onUnmounted, ref } from "vue";
import { GameEvent, StatUpdate } from "../data/events";
import Manager from "../data/manager";

const money = ref(0);
const level = ref(0);
const remainingEnemies = ref(0);
const inProgress = ref(false);
const integrity = ref(0);

const eventHandler = (stats: StatUpdate) => {
  money.value = stats.money;
  level.value = stats.level;
  remainingEnemies.value = stats.remainingEnemies;
  inProgress.value = stats.inProgress;
  integrity.value = stats.integrity;
};

onMounted(() => {
  Manager.Instance.addEventListener(GameEvent.StatUpdate, eventHandler);
});

onUnmounted(() => {
  Manager.Instance.removeEventListener(GameEvent.StatUpdate, eventHandler);
});

function start() {
  Manager.Instance.start();
}
</script>

<template>
  <div class="top-bar">
    <ul class="stats">
      <li>
        <span>🪙 {{ money }}</span> <span>🛡️ {{ integrity }}</span>
      </li>
      <li>
        <span>Wave {{ level }}</span>
        <button @click="start()" :disabled="inProgress">Start wave</button>
      </li>
      <li>👾 {{ remainingEnemies }}</li>
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

    li {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
  }
}
</style>
