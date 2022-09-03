<script setup lang="ts">
const props = defineProps<{
  button: "left" | "right" | "middle";
}>();
</script>

<template>
  <div :class="`mouse button-${props.button}`"></div>
</template>

<style lang="scss" scoped>
.mouse {
  display: inline-flex;
  vertical-align: middle;
  border: 1px solid #888;
  border-radius: 50%;
  height: 24px;
  width: 16px;
  overflow: hidden;
}

.button-left:after {
  content: "";
  background: #888;
  width: 8px;
  height: 12px;
  display: block;
}

.button-right:after {
  content: "";
  background: #888;
  width: 8px;
  height: 12px;
  margin-left: 8px;
  display: block;
}

.button-middle:after {
  content: "";
  background: #888;
  width: 4px;
  height: 10px;
  margin-left: 6px;
  display: block;
  border-radius: 50%;
}
</style>
