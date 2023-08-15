<script setup lang="ts">
import { StyleValue } from "vue";

const props = defineProps<{
  onClick?: () => void;
  active?: boolean;
  className?: Record<string, boolean>;
  style?: StyleValue;
}>();
</script>

<template>
  <button
    :is="props.onClick ? 'button' : 'div'"
    @click="onClick"
    :class="{
      'ui-element': true,
      'ui-element--interactive': props.onClick,
      'ui-element--active': props.active,
      ...props.className,
    }"
    :style="props.style"
  >
    <slot></slot>
  </button>
</template>

<style lang="scss" scoped>
.ui-element {
  display: flex;
  align-items: center;
  flex-direction: row;
  justify-content: center;
  gap: 0.3rem;

  color: #fff;
  background-color: #2676d1;
  border: 3px solid #fff;
  border-radius: 15px;
  box-shadow: 5px 5px 10px -2px #000;

  &--interactive {
    cursor: pointer;
    pointer-events: all;

    &:hover {
      background-color: #7ba7d9;
    }
  }

  &--active {
    background-color: #7ba7d9;
  }
}
</style>
