<script setup lang="ts">
import MovementGrid from "./controls/MovementGrid.vue";
import Key from "./controls/Key.vue";
import Mouse from "./controls/mouse.vue";
</script>

<template>
  <h3>Build menu</h3>
  <div class="flex">
    <Key char="e" />
    /
    <Key char="b" />
  </div>
  <h3>Building</h3>
  <div class="flex flex-justify">
    <Mouse button="left" />
    /
    <span class="key-combination">
      <Key char="⇧" />
      +
      <Mouse button="left" />
    </span>
    /
    <span class="key-combination">
      <Key char="⌘" />
      +
      <Mouse button="left" />
    </span>
  </div>
  <h3>Moving</h3>
  <div class="flex flex-justify">
    <MovementGrid>
      <Key char="w" area="up" />
      <Key char="a" area="left" />
      <Key char="s" area="down" />
      <Key char="d" area="right" />
    </MovementGrid>
    /
    <MovementGrid>
      <Key char="z" area="up" />
      <Key char="q" area="left" />
      <Key char="s" area="down" />
      <Key char="d" area="right" />
    </MovementGrid>
    /
    <MovementGrid>
      <Key char="↑" area="up" />
      <Key char="←" area="left" />
      <Key char="↓" area="down" />
      <Key char="→" area="right" />
    </MovementGrid>
  </div>
  <h3>Zooming</h3>
  <div class="flex">
    <Key char="-" />
    <Key char="+" />
  </div>
  <h3>Toggle selling</h3>
  <div class="flex">
    <Key char="f" />
  </div>
</template>

<style lang="scss" scoped>
h3 {
  font-size: 30px;
  text-align: center;
  color: #fff;

  &:not(:first-of-type) {
    margin-top: 10px;
  }
}

.flex {
  color: #888;
  display: flex;
  justify-content: center;
  align-items: end;
  gap: 5px;

  &-justify {
    justify-content: space-between;
  }
}

.key-combination {
  display: flex;
  gap: 5px;
}
</style>
