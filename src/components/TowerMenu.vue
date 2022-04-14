<script setup lang="ts">
import { computed, ref } from "vue";
import Controller from "../data/controller";
import placeables, { Placeable } from "../data/placeables";

const props = defineProps<{
  controller: Controller;
}>();

const menuVisible = ref(false);

const transform = computed(() => {
  return `translate(${menuVisible.value ? 0 : 200}px)`;
});
const arrow = computed(() => {
  return menuVisible.value ? ">" : "<";
});

const selectedPlaceable = ref(props.controller.getPlacable());

function toggleMenu() {
  menuVisible.value = !menuVisible.value;
}

function selectTower(tower: Placeable) {
  props.controller.setPlaceable(tower);
  selectedPlaceable.value = tower;
}
</script>

<template>
  <div class="menu-wrapper" :style="{ transform }">
    <div class="button-holder">
      <button @click="toggleMenu()">{{ arrow }}</button>
    </div>
    <ul class="menu">
      <li
        :class="{
          placeable: true,
          selected: tower.name === selectedPlaceable?.name,
        }"
        v-for="tower in placeables"
      >
        <button @click="selectTower(tower)">
          <h3>{{ tower.name }}</h3>
          <p>{{ tower.cost }} G</p>
          <div class="graphic" v-html="tower.htmlElement"></div>
        </button>
      </li>
    </ul>
  </div>
  <!-- <button @click="start()" :disabled="isStarted">Start wave</button> -->
</template>

<style lang="scss" scoped>
.menu-wrapper {
  display: flex;
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  transition: transform 0.3s;

  .button-holder {
    display: flex;
    align-items: center;

    button {
      height: 40px;
      background: white;
      border: 1px solid #999;
      border-right: none;
      cursor: pointer;
    }
  }

  .menu {
    overflow-x: hidden;
    overflow-y: auto;
    background: white;
    width: 200px;
    .placeable {
      display: flex;
      flex-direction: column;

      &.selected {
        border: 2px solid #66f;
        background-color: #aaf;
        margin: -2px;
      }

      button {
        padding: 12px;
        background: none;
        border: 1px solid #999;
        cursor: pointer;

        .graphic {
          display: flex;
          justify-content: center;
        }
      }
    }
  }
}
</style>
