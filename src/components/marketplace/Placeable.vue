<script setup lang="ts">
import { ITowerStatics } from "../../data/entity/towers";
import { TOWER_PRICES } from "../../data/moneyController";
import { Placeable } from "../../data/placeables";
import { POWER_CONSUMPTIONS } from "../../data/powerController";

const props = defineProps<{
  item: Placeable;
  locked: boolean;

  onSelect: (item: Placeable) => void;
  selected: boolean;
}>();

const price = TOWER_PRICES[props.item.entityType];
const range =
  props.item.entity && (props.item.entity as unknown as ITowerStatics).range;
</script>

<template>
  <button
    :class="{
      placeable: true,
      'placeable--locked': props.locked,
      'placeable--selected': props.selected,
    }"
    @click="props.onSelect(item)"
  >
    <span class="sprite">{{ props.item.htmlElement }}</span>
    <span class="name"
      >{{ props.item.name }}
      <span v-if="props.locked" class="lock">🔒</span></span
    >
    <ul class="data">
      <li v-if="!!price"><span class="emoji">🪙</span> {{ price }}</li>
      <li v-if="range"><span class="emoji">📐</span> {{ range }}</li>
      <li v-if="!!POWER_CONSUMPTIONS[props.item.entityType]">⚡</li>
      <li v-if="props.item.isBasePart">🧱</li>
    </ul>
  </button>
</template>

<style lang="scss" scoped>
.placeable {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #fff;

  width: 192px;
  height: 192px;

  border: none;
  background: none;
  margin: 4px 4px 0px 4px;
  padding: 4px;

  &--selected {
    background: rgba(255, 255, 255, 0.15);
  }

  &--locked {
    background: rgba(0, 0, 0, 0.25);
  }

  &--selected,
  &:hover {
    border: 4px dashed #fff;
    padding: 0;

    .data {
      border: none;
      padding-bottom: 1px;
    }
  }

  .sprite {
    position: absolute;
    top: 0;
    left: 0;
    font-size: 82px;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .name {
    align-self: center;
    margin: 8px;
    display: flex;
    align-items: baseline;

    .lock {
      margin-left: 6px;
    }
  }

  .data {
    align-self: flex-end;
    display: flex;
    justify-content: center;
    width: 100%;
    border-bottom: 1px solid #fff;

    li {
      &:not(:first-of-type) {
        border-left: 1px solid #fff;
      }

      width: 48px;
      height: 32px;

      display: flex;
      align-items: center;
      justify-content: center;
      flex: 1;

      .emoji {
        font-size: 14px;
        margin-right: 6px;
      }
    }
  }
}
</style>
