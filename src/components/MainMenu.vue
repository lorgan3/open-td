<script setup lang="ts">
import { ref } from "vue";
import ControlsList from "./ControlsList.vue";

const props = defineProps<{
  onPlay: (seed: string) => void;
}>();

enum SubMenu {
  None,
  Play,
  Controls,
  Settings,
}

const openSubMenu = ref(SubMenu.None);
const seed = ref("");
const seedInput = ref<HTMLElement | null>(null);

const onClick = (subMenu: SubMenu) => {
  if (subMenu === openSubMenu.value) {
    openSubMenu.value = SubMenu.None;
    return;
  }
  openSubMenu.value = subMenu;

  if (openSubMenu.value === SubMenu.Play) {
    seedInput.value?.focus();
  }
};

const submit = (event: Event) => {
  event.preventDefault();

  props.onPlay(seed.value);
};
</script>

<template>
  <div class="wrapper">
    <h1>Open Tower Defense 🗼</h1>

    <div class="menu">
      <div class="menu-main">
        <div class="menu-main-inner">
          <button @click="onClick(SubMenu.Play)">Play</button>
          <button @click="onClick(SubMenu.Controls)">Controls</button>
          <button disabled>Settings</button>
        </div>
      </div>
      <div
        :class="{
          'menu-play': true,
          'menu--hidden': openSubMenu !== SubMenu.Play,
        }"
      >
        <form @submit="submit" class="menu-play-inner">
          <h3>Which planet?</h3>
          <input ref="seedInput" v-model="seed" />
          <button type="submit">Start!</button>
        </form>
      </div>
      <div
        :class="{
          'menu-controls': true,
          'menu--hidden': openSubMenu !== SubMenu.Controls,
        }"
      >
        <div class="menu-play-inner">
          <ControlsList />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    180deg,
    rgb(44, 49, 120) 0%,
    rgb(19, 20, 40) 100%
  );

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10vh;

  h1 {
    text-align: center;
    color: #fff;
    font-size: 84px;
  }

  h3 {
    font-size: 30px;
    text-align: center;
    color: #fff;
  }

  button,
  input {
    width: 100%;
    height: 48px;
    box-sizing: border-box;
    font-size: 30px;
    text-align: center;
  }

  .menu {
    position: relative;
    display: flex;
    flex-direction: row;
    height: 50vh;

    > * {
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      gap: 20px;

      &:first-child {
        border-left: 2px solid black;
      }
      border-right: 2px solid black;
      transition: width 1s;
      width: 340px;
    }

    &--hidden {
      width: 0px;
    }

    &-main,
    &-play,
    &-controls {
      &-inner {
        width: 300px;
        padding: 0 20px;

        display: flex;
        flex-direction: column;
        gap: 20px;
      }
    }

    &-play {
      left: -2px;
    }
    &-controls {
      left: -4px;
    }
  }
}
</style>
