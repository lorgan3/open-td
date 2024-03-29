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
import { get } from "../../util/localStorage";
import { IconType } from "../hud/constants";
import Icon from "../hud/Icon.vue";

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

const icons: Partial<Record<EntityType, IconType>> = {
  [EntityType.Barracks]: IconType.Castle,
  [EntityType.Convert]: IconType.Recycle,
  [EntityType.DamageBeacon]: IconType.Up,
  [EntityType.Excavator]: IconType.Hammer,
  [EntityType.Fence]: IconType.Wall,
  [EntityType.Flamethrower]: IconType.Turret,
  [EntityType.Laser]: IconType.Turret,
  [EntityType.Market]: IconType.Castle,
  [EntityType.Mortar]: IconType.Turret,
  [EntityType.PowerPlant]: IconType.Castle,
  [EntityType.Radar]: IconType.Castle,
  [EntityType.Railgun]: IconType.Turret,
  [EntityType.EmergencyRecharge]: IconType.Recycle,
  [EntityType.EmergencyRepair]: IconType.Recycle,
  [EntityType.None]: IconType.Hammer,
  [EntityType.SpeedBeacon]: IconType.Up,
  [EntityType.Freezer]: IconType.Down,
  [EntityType.Terraform]: IconType.Hammer,
  [EntityType.Tesla]: IconType.Turret,
  [EntityType.Tower]: IconType.Turret,
  [EntityType.Wall]: IconType.Wall,
};

const selected = ref(props.controller.getPlacable());
const instance = getCurrentInstance();
const simpleMode = ref(get("settings")?.showTutorial);

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

const toggleSimpleMode = () => {
  simpleMode.value = !simpleMode.value;
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
      <button @click="close" class="close-button">
        <Icon :type="IconType.Cross" />
      </button>
      <button @click="toggleSimpleMode" class="view-mode-button">
        <Icon :type="simpleMode ? IconType.Pacifier : IconType.Binoculars" />
      </button>

      <div class="inner">
        <div class="menu">
          <div v-for="group in groups" class="group">
            <div class="title">{{ group }}</div>
            <div class="items">
              <div class="item-wrapper" v-for="placeable in SECTIONS[group]">
                <button
                  v-if="
                    !simpleMode ||
                    props.unlocksController.isUnlocked(placeable) ||
                    props.unlocksController.canUnlock(placeable)
                  "
                  :class="{
                    item: true,
                    'item--locked':
                      !props.unlocksController.isUnlocked(placeable),
                    'item--selected':
                      selected?.entityType === placeable.entityType,
                  }"
                  :onClick="() => onSelect(placeable)"
                >
                  <span class="truncate">
                    <Icon :type="icons[placeable.entityType]!" />
                    {{ placeable.name }}</span
                  >
                  <span v-if="TOWER_PRICES[placeable.entityType]"
                    >{{ TOWER_PRICES[placeable.entityType] }}
                    <Icon :type="IconType.Money" />
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="detail">
          <h2 class="detail-name">{{ selected.name }}</h2>
          <div class="detail-summary">
            <img :src="'portraits/' + images[selected.entityType]" />
            <div class="hints">
              <span
                v-if="selected.entity && (selected.entity as unknown as ITowerStatics).range"
              >
                <Icon :type="IconType.Turret" /> <strong>Ranged</strong> This
                building attacks enemies within
                {{ (selected.entity as unknown as ITowerStatics).range }}
                tiles.</span
              >
              <span v-if="!!POWER_CONSUMPTIONS[selected.entityType]">
                <Icon :type="IconType.Battery" /> <strong>Powered</strong> This
                building requires power to function. Be sure to build some power
                plants first.</span
              >
              <span v-if="!!selected.isBasePart">
                <Icon :type="IconType.Castle" /> <strong>Base</strong> This
                building is part of your base and must be built next to an
                adjacent base building. Be sure to protect it from
                enemies!</span
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

.menu {
  border-right: 2px solid #fff;
  overflow-x: hidden;
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
  margin-right: -2px;

  .title {
    width: 200px;
    padding: 6px;
  }

  .items {
    flex: 1;
    display: flex;
    flex-direction: column;
    margin: -2px;
    overflow: hidden;

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
      flex: 1;
      gap: 3px;

      > * {
        white-space: nowrap;
      }

      .truncate {
        overflow: hidden;
        text-overflow: ellipsis;
      }

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

      &-wrapper {
        display: contents;
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

  .close-button,
  .view-mode-button {
    position: absolute;
    right: 0;
    background: none;
    color: #fff;
    border: none;
    cursor: pointer;
    height: 24px;
    width: 24px;
    display: flex;
    padding: 0px;
    align-items: center;
    justify-content: center;
    margin: 5px;

    &:hover {
      background: #ffffff5f;
      border-radius: 4px;
    }
  }

  .view-mode-button {
    right: 36px;
    font-size: 18px;
  }
}
</style>
