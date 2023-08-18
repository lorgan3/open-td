<script setup lang="ts">
import { IconType } from "./constants";

const SPRITES_PER_ROW = 4;
const SPRITE_SIZE = 16;

const props = defineProps<{
  type: IconType;
}>();
</script>

<template>
  <span
    class="icon"
    :style="{
      '--row': `-${Math.floor(props.type / SPRITES_PER_ROW) * SPRITE_SIZE}px`,
      '--column': `-${(props.type % SPRITES_PER_ROW) * SPRITE_SIZE}px`,
    }"
  />
</template>

<style lang="scss" scoped>
.icon {
  display: inline-block;
  width: 16px;
  height: 16px;
  background: url(/open-td/src/assets/icons.png) var(--column) var(--row);
  image-rendering: pixelated;
}
</style>
