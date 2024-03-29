<script setup lang="ts">
import Controller from "../../data/controllers/controller";

import { getCurrentInstance, onMounted, onUnmounted, ref } from "vue";
import { Placeable as TPlaceable } from "../../data/placeables";

import { Group, SECTIONS } from "../../data/placeables";
import Placeable from "./Placeable.vue";
import { GameEvent } from "../../data/events";
import UnlocksController from "../../data/controllers/unlocksController";
import EventSystem from "../../data/eventSystem";

const props = defineProps<{
  controller: Controller;
  unlocksController: UnlocksController;
  eventSystem: EventSystem;
  visible: boolean;
}>();

const selected = ref(props.controller.getPlacable());
const instance = getCurrentInstance();

let removeSelectPlaceableEventListener: () => void;
onMounted(() => {
  removeSelectPlaceableEventListener = props.eventSystem.addEventListener(
    GameEvent.SelectPlaceable,
    ({ placeable }) => (selected.value = placeable)
  );
});

onUnmounted(() => {
  if (removeSelectPlaceableEventListener) {
    removeSelectPlaceableEventListener();
  }
});

const onSelect = (item: TPlaceable) => {
  // Double clicking closes the menu.
  if (item === props.controller.getPlacable()) {
    if (props.unlocksController.isUnlocked(item)) {
      props.controller.toggleBuildMenu();

      return;
    }

    if (props.unlocksController.canUnlock(item)) {
      unlock();
      return;
    }
  }

  props.controller.setPlaceable(item);
};

const groups = Object.values(Group);

const unlock = () => {
  props.unlocksController.unlock(selected.value!);
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
      'marketplace-wrapper--visible': props.visible,
    }"
  >
    <div class="marketplace">
      <div class="info">
        <p class="description">
          {{ selected ? selected.description : "Select a tower below." }}
        </p>
        <div class="section">
          {{ props.unlocksController.getPoints() }} wave points
          <button
            v-if="
              selected &&
              (!props.unlocksController.isUnlocked(selected) ||
                selected.isRepeatable)
            "
            :disabled="!props.unlocksController.canUnlock(selected)"
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
              :locked="!props.unlocksController.isUnlocked(placeable)"
              :selected="selected?.entityType === placeable.entityType"
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
