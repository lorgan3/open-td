<script setup lang="ts">
const { visible, mainMenu } = defineProps<{
  visible: boolean;
  mainMenu: () => void;
  resume: () => void;
}>();
</script>

<template>
  <div
    :class="{
      'menu-wrapper': true,
      'menu-wrapper--visible': visible,
    }"
  >
    <div class="menu">
      <h3>Paused</h3>
      <button @click="resume">Resume</button>
      <button @click="mainMenu">Main menu</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.menu-wrapper {
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

    .menu {
      transform: translateY(0vh);
    }
  }
}

.menu {
  width: 300px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: calc(100vw - 48px);
  max-height: calc(100% - 30px);
  transition: transform 0.5s;
  transform: translateY(100vh);
  background: rgb(59, 77, 152);
  border: 2px solid #000;
  border-radius: 3px;

  h3 {
    font-size: 24px;
    text-align: center;
    color: #fff;
  }
}
</style>
