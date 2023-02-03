<script setup lang="ts">
import { ref } from "vue";
import { difficulties, Difficulty } from "../data/difficulty";
import { Constructor } from "../renderers/api";
import EmojiRenderer from "../renderers/emojiRenderer/renderer";
import PixiRenderer from "../renderers/pixiRenderer/renderer";
import { get, set } from "../util/localStorage";
import ControlsList from "./ControlsList.vue";

import { version } from "../../package.json";
import { getAssets } from "../renderers/pixiRenderer/assets";

const props = defineProps<{
  onPlay: (
    seed: string,
    difficulty: Difficulty,
    renderer: Constructor,
    showTutorial: boolean
  ) => void;
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
const showTutorial = ref(storedData?.showTutorial ?? true);
const volume = ref(storedData?.volume ?? 100);

const assetsLoading = ref(true);
getAssets().then(() => (assetsLoading.value = false));

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
    showTutorial: showTutorial.value,
    volume: volume.value,
  });

  props.onPlay(
    seed.value,
    difficulty.value,
    renderer.value.value,
    showTutorial.value
  );
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
          <label class="horizontal">
            <input type="checkbox" v-model="showTutorial" />
            Show tutorial
          </label>
          <label>
            Volume
            <input type="range" min="0" max="100" v-model="volume" />
          </label>
        </div>
      </div>
    </div>
    <div class="footer">
      <span>{{ version }}</span>
      <a
        class="footer-link"
        href="https://github.com/lorgan3/open-td/releases"
        target="_blank"
        rel="noopener noreferrer"
        >Release notes</a
      >
      <span v-if="assetsLoading"
        ><span class="spinner">߷</span> Loading assets</span
      >
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

  h1 {
    text-align: center;
    color: #fff;
    font-size: 84px;
    margin: 10vh 0;
  }

  label {
    font-size: 30px;
    text-align: center;
    color: #fff;

    display: flex;
    flex-direction: column;
    gap: 20px;

    &.horizontal {
      flex-direction: row;
    }
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

  input[type="checkbox"] {
    width: 30px;
    margin: 0;
    height: auto;
  }

  input[type="range"] {
    height: auto;
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
    height: calc(70vh - 84px);
    margin-bottom: 10vh;

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

  .footer {
    position: fixed;
    bottom: 0;
    left: 0;
    margin: 20px;
    color: #fff;
    display: flex;
    gap: 10px;
    align-items: center;
    height: 44px;

    &-link {
      color: #fff;
      padding: 8px 16px;
      background: rgb(31, 34, 77);
      text-decoration: initial;
      border-radius: 6px;
      border-bottom: 2px solid #000;
      border-right: 2px solid #000;

      &:hover {
        background: rgb(44, 49, 120);
        border: none;
      }
    }

    .spinner {
      animation: spin 0.5s linear infinite;
      display: inline-block;
      transform-origin: 50%;
      line-height: 20px;
      width: 24px;
      height: 24px;

      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    }
  }
}
</style>
