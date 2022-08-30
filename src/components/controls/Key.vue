<script setup lang="ts">
const props = defineProps<{
  char: string;
  emoji?: boolean;
  area?: string;
}>();
</script>

<template>
  <div
    :class="{ key: true, emoji: props.emoji }"
    :style="{ gridArea: props.area }"
  >
    {{ props.char }}
  </div>
</template>

<style lang="scss" scoped>
.key {
  border: 1px solid #888;
  color: #888;
  border-radius: 3px;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: end;
  justify-content: center;
}

.emoji {
  font-size: 20px;
}
</style>
