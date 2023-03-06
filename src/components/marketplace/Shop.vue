<script setup lang="ts">
import Controller from "../../data/controllers/controller";

import { getCurrentInstance, onMounted, onUnmounted, ref } from "vue";
import { Placeable as TPlaceable } from "../../data/placeables";

import { Group, SECTIONS } from "../../data/placeables";

import { GameEvent } from "../../data/events";
import UnlocksController from "../../data/controllers/unlocksController";
import EventSystem from "../../data/eventSystem";
import { EntityType } from "../../data/entity/constants";
import { TOWER_PRICES } from "../../data/controllers/moneyController";
import { ITowerStatics } from "../../data/entity/towers";
import { POWER_CONSUMPTIONS } from "../../data/controllers/powerController";

const props = defineProps<{
  controller: Controller;
  unlocksController: UnlocksController;
  eventSystem: EventSystem;
  visible: boolean;
}>();

const images: Partial<Record<EntityType, string>> = {
  [EntityType.Barracks]: "barracks.png",
  [EntityType.Convert]: "convert.png",
  [EntityType.DamageBeacon]: "damagebeacon.png",
  [EntityType.Excavator]: "excavator.png",
  [EntityType.Fence]: "fence.png",
  [EntityType.Flamethrower]: "flamethrower.png",
  [EntityType.Laser]: "laser.png",
  [EntityType.Market]: "market.png",
  [EntityType.Mortar]: "mortar.png",
  [EntityType.PowerPlant]: "powerplant.png",
  [EntityType.Radar]: "radar.png",
  [EntityType.Railgun]: "railgun.png",
  [EntityType.EmergencyRecharge]: "recharge.png",
  [EntityType.EmergencyRepair]: "repair.png",
  [EntityType.None]: "sell.png",
  [EntityType.SpeedBeacon]: "speedbeacon.png",
  [EntityType.Freezer]: "tar.png",
  [EntityType.Terraform]: "terraform.png",
  [EntityType.Tesla]: "tesla.png",
  [EntityType.Tower]: "tower.png",
  [EntityType.Wall]: "wall.png",
};

const icons: Partial<Record<EntityType, string>> = {
  [EntityType.Barracks]: "🏛️",
  [EntityType.Convert]: "♻",
  [EntityType.DamageBeacon]: "📈",
  [EntityType.Excavator]: "⛏️",
  [EntityType.Fence]: "🚧",
  [EntityType.Flamethrower]: "🗼",
  [EntityType.Laser]: "🗼",
  [EntityType.Market]: "🏛️",
  [EntityType.Mortar]: "🗼",
  [EntityType.PowerPlant]: "🏛️",
  [EntityType.Radar]: "🏛️",
  [EntityType.Railgun]: "🗼",
  [EntityType.EmergencyRecharge]: "♻",
  [EntityType.EmergencyRepair]: "♻",
  [EntityType.None]: "⛏️",
  [EntityType.SpeedBeacon]: "📈",
  [EntityType.Freezer]: "📉",
  [EntityType.Terraform]: "⛏️",
  [EntityType.Tesla]: "🗼",
  [EntityType.Tower]: "🗼",
  [EntityType.Wall]: "🚧",
};

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
    if (props.unlocksController.canUnlock(item)) {
      unlock();
      return;
    }

    if (props.unlocksController.isUnlocked(item)) {
      props.controller.toggleBuildMenu();

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
      <button @click="close" class="close-button">✖</button>
      <div class="inner">
        <div class="menu">
          <div v-for="group in groups" class="group">
            <div class="title">{{ group }}</div>
            <div class="items">
              <button
                v-for="placeable in SECTIONS[group]"
                :class="{
                  item: true,
                  'item--locked':
                    !props.unlocksController.isUnlocked(placeable),
                  'item--selected':
                    selected?.entityType === placeable.entityType,
                }"
                :onClick="() => onSelect(placeable)"
              >
                <span>
                  <span class="emoji">{{ icons[placeable.entityType] }}</span>
                  {{ placeable.name }}</span
                >
                <span v-if="TOWER_PRICES[placeable.entityType]"
                  >{{ TOWER_PRICES[placeable.entityType] }}
                  <span class="emoji">🪙</span>
                </span>
              </button>
            </div>
          </div>
        </div>
        <div class="detail">
          <h2 class="detail-name">{{ selected.name }}</h2>
          <div class="detail-summary">
            <img :src="images[selected.entityType]" />
            <div class="hints">
              <span
                v-if="selected.entity && (selected.entity as unknown as ITowerStatics).range"
                >🎯 <strong>Ranged</strong> This building attacks enemies within
                {{ (selected.entity as unknown as ITowerStatics).range }}
                tiles.</span
              >
              <span v-if="!!POWER_CONSUMPTIONS[selected.entityType]"
                >⚡ <strong>Powered</strong> This building requires power to
                function. Be sure to build some power plants first.</span
              >
              <span v-if="!!selected.isBasePart"
                >🏛️ <strong>Base</strong> This building is part of your base and
                must be built next to an adjacent base building. Be sure to
                protect it from enemies!</span
              >
            </div>
          </div>
          <article class="detail-description">
            {{ selected.description }}
          </article>

          <aside class="wavepoints">
            <button
              :disabled="!props.unlocksController.canUnlock(selected)"
              :onclick="unlock"
            >
              {{
                selected.isRepeatable
                  ? "Activate"
                  : props.unlocksController.isUnlocked(selected)
                  ? "Unlocked"
                  : "Unlock"
              }}
            </button>
            ({{ props.unlocksController.getPoints() }} wave points remaining)
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.inner {
  display: flex;
  flex-direction: row;
  gap: 24px;
  height: 100%;
}

.menu,
.detail {
  display: flex;
  flex-direction: column;
  width: 450px;
  overflow: auto;
  scrollbar-width: thin;
  scrollbar-color: #fff transparent;

  &::-webkit-scrollbar {
    width: 5px;
    background-color: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #fff;
  }
}

.detail {
  width: 500px;
  gap: 24px;
  padding-right: 12px;

  &-name {
    font-size: 48px;
    text-align: center;
  }

  &-summary {
    display: flex;
    gap: 12px;
    justify-content: center;

    img {
      width: 200px;
      border: 2px solid #fff;
      align-self: center;
    }

    .hints {
      display: flex;
      flex-direction: column;
      gap: 6px;

      strong {
        text-decoration: underline;
      }
    }
  }

  &-description {
    border-top: 2px solid #fff;
    padding-top: 24px;
  }

  .wavepoints {
    align-self: center;
    margin-top: auto;
    margin-bottom: 12px;

    button {
      min-width: 100px;
    }
  }
}

.group {
  border: 2px solid #fff;
  border-left: none;
  display: flex;
  flex-direction: row;

  .title {
    width: 200px;
    padding: 6px;
  }

  .items {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin: -2px;

    .item {
      border: 2px solid #fff;
      background: none;
      color: white;
      padding: 3px 6px;
      text-align: left;
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;

      &:not(:first-child) {
        margin-top: -2px;
      }

      &--locked {
        background: #00000037;
        color: #acacac;
      }

      &--selected,
      &:hover {
        background: #ffffff37;
      }
    }
  }
}

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
  max-height: min(100% - 30px, 600px);
  height: 100%;
  margin: 24px;
  background: #2676d1;
  box-shadow: 0 0 5px 5px #2676d1;
  color: white;
  transition: transform 0.5s;
  transform: translateY(100vh);

  .close-button {
    position: absolute;
    right: 0;
    background: none;
    color: #fff;
    border: none;
    cursor: pointer;

    &:hover {
      background: #ffffff5f;
      border-radius: 4px;
    }
  }
}
</style>
