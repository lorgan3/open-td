<script setup lang="ts">
import { ref } from "vue";
import { difficulties, Difficulty } from "../data/difficulty";
import { Constructor } from "../renderers/api";
import EmojiRenderer from "../renderers/emojiRenderer/renderer";
import PixiRenderer from "../renderers/pixiRenderer/renderer";
import { get, set } from "../util/localStorage";
import ControlsList from "./ControlsList.vue";

const props = defineProps<{
  onPlay: (seed: string, difficulty: Difficulty, renderer: Constructor) => void;
}>();

enum SubMenu {
  None,
  Play,
  Controls,
  Settings,
}

const renderOptions: Array<{ label: string; value: Constructor }> = [
  {
    label: "Emoji renderer",
    value: EmojiRenderer,
  },
  {
    label: "Pixi renderer",
    value: PixiRenderer,
  },
];

const storedData = get("settings");

const openSubMenu = ref(SubMenu.None);
const seed = ref("");
const seedInput = ref<HTMLElement | null>(null);
const difficulty = ref(storedData?.difficulty || Difficulty.Easy);
const renderer = ref(
  (storedData &&
    renderOptions.find(({ value }) => value === storedData.renderer)) ||
    renderOptions[0]
);

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

  set("settings", {
    renderer: renderer.value.value,
    difficulty: difficulty.value,
  });

  props.onPlay(seed.value, difficulty.value, renderer.value.value);
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
          <button @click="onClick(SubMenu.Settings)">Settings</button>
        </div>
      </div>
      <div
        :class="{
          'menu-play': true,
          'menu--hidden': openSubMenu !== SubMenu.Play,
        }"
      >
        <form @submit="submit" class="menu-play-inner">
          <label>
            Which planet?
            <input ref="seedInput" v-model="seed" />
          </label>
          <label>
            Difficulty
            <select v-model="difficulty">
              <option v-for="({ label }, value) in difficulties" :value="value">
                {{ label }}
              </option>
            </select>
          </label>
          <p class="difficulty-description">
            {{ difficulties[difficulty].description }}
          </p>
          <button type="submit">Start!</button>
        </form>
      </div>
      <div
        :class="{
          'menu-controls': true,
          'menu--hidden': openSubMenu !== SubMenu.Controls,
        }"
      >
        <div class="menu-controls-inner">
          <ControlsList />
        </div>
      </div>
      <div
        :class="{
          'menu-settings': true,
          'menu--hidden': openSubMenu !== SubMenu.Settings,
        }"
      >
        <div class="menu-settings-inner">
          <label>
            Renderer
            <select v-model="renderer">
              <option v-for="option in renderOptions" :value="option">
                {{ option.label }}
              </option>
            </select>
          </label>
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

  label {
    font-size: 30px;
    text-align: center;
    color: #fff;

    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  button,
  input {
    width: 100%;
    height: 48px;
    box-sizing: border-box;
    font-size: 30px;
    text-align: center;
    font-family: JupiterCrash;
    flex-shrink: 0;
  }

  select {
    height: 48px;
    font-size: 30px;
    text-align: center;
    font-family: JupiterCrash;
    -webkit-appearance: menulist-button;
    line-height: 42px;
    flex-shrink: 0;
  }

  .difficulty-description {
    color: #fff;
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
    &-controls,
    &-settings {
      &-inner {
        width: 300px;
        padding: 20px;
        overflow: auto;

        scrollbar-width: thin;
        scrollbar-color: black transparent;

        &::-webkit-scrollbar {
          width: 5px;
          background-color: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background: black;
        }

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
    &-settings {
      left: -6px;
    }
  }
}
</style>
