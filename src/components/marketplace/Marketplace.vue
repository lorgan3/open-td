<script setup lang="ts">
import Controller from "../../data/controller";

import { getCurrentInstance, onMounted, onUnmounted, ref } from "vue";
import { Placeable as TPlaceable } from "../../data/placeables";

import { DEMOLISH, Group, SECTIONS } from "../../data/placeables";
import Placeable from "./Placeable.vue";
import Manager from "../../data/manager";
import { GameEvent } from "../../data/events";
import UnlocksController from "../../data/UnlocksController";

const props = defineProps<{
  controller: Controller;
  unlocksController: UnlocksController;
  manager: Manager;
}>();

const selected = ref(props.controller.getPlacable());
const visible = ref(false);
const instance = getCurrentInstance();

let removeOpenMenuEventListener: () => void;
let removeCloseMenuEventListener: () => void;
onMounted(() => {
  removeOpenMenuEventListener = props.manager.addEventListener(
    GameEvent.OpenBuildMenu,
    () => (visible.value = true)
  );
  removeCloseMenuEventListener = props.manager.addEventListener(
    GameEvent.CloseBuildMenu,
    () => (visible.value = false)
  );
});

onUnmounted(() => {
  if (removeOpenMenuEventListener && removeCloseMenuEventListener) {
    removeOpenMenuEventListener();
    removeCloseMenuEventListener();
  }
});

const onSelect = (item: TPlaceable) => {
  selected.value = item;
  props.controller.setPlaceable(item);
};

const groups = Object.values(Group);

const unlock = () => {
  props.unlocksController.unlock(selected.value!.entityType);
  instance!.proxy!.$forceUpdate();
};

const close = () => {
  props.controller.toggleBuildMenu();
};
</script>

<template>
  <div
    :class="{
      'marketplace-wrapper': true,
      'marketplace-wrapper--visible': visible,
    }"
  >
    <div class="marketplace">
      <div class="info">
        <p class="description">
          {{ selected ? selected.description : "Select a tower below." }}
        </p>
        <div class="section">
          {{ props.manager.getUnlocksController().getPoints() }} wave points
          <button
            v-if="
              selected &&
              !props.unlocksController.isUnlocked(selected.entityType)
            "
            :disabled="!props.unlocksController.canUnlock(selected.entityType)"
            @click="unlock"
          >
            Unlock {{ selected.name }}
          </button>
        </div>

        <button @click="close" class="close-button">✖</button>
      </div>
      <div class="grid">
        <div v-for="group in groups" class="column">
          <div class="header">{{ group }}</div>
          <div v-for="placeable in SECTIONS[group]" class="item">
            <Placeable
              :item="placeable"
              :locked="
                !props.unlocksController.isUnlocked(placeable.entityType)
              "
              :selected="selected?.entityType === placeable.entityType"
              :onSelect="onSelect"
            />
          </div>
        </div>

        <div class="column">
          <div class="header">Sell</div>
          <div class="item">
            <Placeable
              :item="DEMOLISH"
              :locked="false"
              :selected="selected?.entityType === DEMOLISH.entityType"
              :onSelect="onSelect"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.marketplace-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1;
  pointer-events: none;
  background-color: rgba(0, 0, 0, 0);
  transition: background-color 0.5s;

  &--visible {
    pointer-events: all;
    background-color: rgba(0, 0, 0, 0.85);

    .marketplace {
      transform: translateY(0vh);
    }
  }
}

.marketplace {
  display: flex;
  flex-direction: column;
  gap: 24px;
  border: 4px double #fff;
  overflow: hidden;
  max-width: calc(100vw - 48px);
  max-height: calc(100% - 30px);
  margin: 24px;
  background: #2676d1;
  box-shadow: 0 0 5px 5px #2676d1;
  color: white;
  transition: transform 0.5s;
  transform: translateY(100vh);

  .info {
    height: 150px;
    display: flex;
    flex-grow: 0;
    border-bottom: 2px solid #fff;

    .description {
      padding: 8px;
      flex: 1;
      width: 0;
    }

    .section {
      padding: 8px;
      width: 200px;
      border-left: 2px solid #fff;
      margin-top: 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;

      button {
        width: 100%;
      }
    }

    .close-button {
      position: absolute;
      right: 0;
      background: 0;
      border: 0;
      color: #fff;
    }
  }

  .grid {
    display: flex;
    flex-direction: row;
    overflow-x: auto;

    .column {
      display: flex;
      flex-direction: column;

      &:not(:first-child) {
        border-left: 2px solid #fff;
      }

      .header {
        border-bottom: 2px solid #fff;
        text-align: center;
        padding: 8px;
      }
    }
  }
}
</style>
