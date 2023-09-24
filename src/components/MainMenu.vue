<script setup lang="ts">
import { onMounted, ref } from "vue";
import { difficulties, Difficulty } from "../data/difficulty";
import { Constructor } from "../renderers/api";
import { get, set, has } from "../util/localStorage";
import ControlsList from "./ControlsList.vue";
import Settings from "./Settings.vue";
import AchievementsList from "./achievements/AchievementsList.vue";

import { version } from "../../package.json";
import { getAssets } from "../renderers/pixiRenderer/assets";
import { Settings as ISettings } from "../util/localStorage/settings";
import { getWord } from "../util/word";
import { logEvent } from "../util/firebase";
import logo from "../assets/logo.png";

import MusicController from "../renderers/pixiRenderer/sound/musicController";

const props = defineProps<{
  onPlay: (
    seed: string | null,
    difficulty: Difficulty,
    renderer: Constructor,
    showTutorial: boolean,
    simulationSpeed: number
  ) => void;
  onCredits: () => void;
}>();

enum SubMenu {
  None,
  Play,
  Controls,
  Achievements,
  Settings,
}

const openSubMenu = ref(SubMenu.None);
const seed = ref(getWord());
const seedInput = ref<HTMLInputElement | null>(null);
const hasSave = ref(false);

onMounted(() => {
  window.setTimeout(() => {
    hasSave.value = has("save");
  }, 0);
});

const storedData = get("settings");
const difficulty = ref(storedData?.difficulty || Difficulty.Easy);

const assetsLoading = ref(true);
getAssets().then(() => {
  assetsLoading.value = false;
});

let getSettings: () => Partial<ISettings>;
const setSubmitter = (submit: typeof getSettings) => (getSettings = submit);

const onClick = (subMenu: SubMenu) => {
  if (subMenu === openSubMenu.value) {
    openSubMenu.value = SubMenu.None;
    return;
  }
  openSubMenu.value = subMenu;

  if (openSubMenu.value === SubMenu.Play) {
    seedInput.value?.select();
  }
};

const updateMusic = (volume: number) => {
  if (assetsLoading.value) {
    return;
  }

  MusicController.Instance.updateVolume(volume / 100);
};

const submit = (event: Event) => {
  event.preventDefault();

  const settings = getSettings();

  set("settings", {
    ...settings,
    difficulty: difficulty.value,
  });

  props.onPlay(
    seed.value,
    difficulty.value,
    settings.renderer!,
    settings.showTutorial!,
    settings.simulation!
  );

  logEvent("play", { difficulty: difficulty.value });
};

const loadSave = (event: Event) => {
  event.preventDefault();

  const settings = getSettings();

  set("settings", settings);

  props.onPlay(
    null,
    difficulty.value,
    settings.renderer!,
    false,
    settings.simulation!
  );

  logEvent("play_save");
};
</script>

<template>
  <div class="wrapper">
    <h1 class="main-title">
      <img :src="logo" alt="Open Tower Defense" /> Open Tower Defense
    </h1>

    <div class="menu">
      <div class="menu-main">
        <div class="menu-main-inner">
          <button v-if="hasSave" @click="loadSave">Continue</button>
          <button @click="onClick(SubMenu.Play)">Play</button>
          <button @click="onClick(SubMenu.Controls)">Controls</button>
          <button @click="onClick(SubMenu.Achievements)">Achievements</button>
          <button @click="onClick(SubMenu.Settings)">Settings</button>
          <button @click="onCredits()">Credits</button>
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
            Which world?
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
          'menu-achievements': true,
          'menu--hidden': openSubMenu !== SubMenu.Achievements,
        }"
      >
        <div class="menu-controls-inner">
          <AchievementsList />
        </div>
      </div>
      <div
        :class="{
          'menu-settings': true,
          'menu--hidden': openSubMenu !== SubMenu.Settings,
        }"
      >
        <div class="menu-settings-inner">
          <Settings :setSubmitter="setSubmitter" :updateMusic="updateMusic" />
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

  .main-title {
    text-align: center;
    color: #fff;
    font-size: 84px;
    margin: 1vh 0;
    display: flex;
    flex-direction: column;
    align-items: center;

    img {
      width: 2em;
      image-rendering: pixelated;
    }
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
      align-items: baseline;

      select {
        flex: 1;
      }
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
    max-width: 100%;
    overflow-x: scroll;
    scroll-snap-type: x mandatory;

    scrollbar-width: thin;
    scrollbar-color: #fff transparent;

    &::-webkit-scrollbar {
      height: 5px;
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #fff;
    }

    > * {
      scroll-snap-align: start;
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      flex-shrink: 0;
      gap: 20px;

      &:first-child {
        border-left: 2px solid #fff;
      }
      border-right: 2px solid #fff;
      transition: width 1s;
      width: 340px;
    }

    &--hidden {
      width: 0px;
    }

    &-main,
    &-play,
    &-controls,
    &-achievements,
    &-settings {
      &-inner {
        width: 300px;
        padding: 20px;
        overflow: auto;

        scrollbar-width: thin;
        scrollbar-color: #fff transparent;

        &::-webkit-scrollbar {
          width: 5px;
          background-color: transparent;
        }

        &::-webkit-scrollbar-thumb {
          background: #fff;
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
    &-achievements {
      left: -6px;
    }
    &-settings {
      left: -8px;
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
    width: 100%;
    background: #15162e;

    &-link {
      color: #fff;
      padding: 8px 16px;
      background: rgb(31, 34, 77);
      text-decoration: initial;
      border-radius: 6px;
      border-bottom: 2px solid #fff;
      border-right: 2px solid #fff;

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
