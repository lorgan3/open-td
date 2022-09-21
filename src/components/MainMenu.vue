<script setup lang="ts">
import { ref } from "vue";
import { Difficulty } from "../data/manager";
import ControlsList from "./ControlsList.vue";

const props = defineProps<{
  onPlay: (seed: string, difficulty: Difficulty) => void;
}>();

enum SubMenu {
  None,
  Play,
  Controls,
  Settings,
}

const difficulties: Record<Difficulty, { label: string; description: string }> =
  {
    [Difficulty.Easy]: {
      label: "Easy",
      description:
        "Allows checking which tiles are covered by tower sight lines. Shows the approximate path enemies will take. Enemies die quicker and undiscovered nests do not become stronger.",
    },
    [Difficulty.Normal]: {
      label: "Normal",
      description:
        "Allows checking which tiles are covered by tower sight lines. Undiscovered nests slowly gain more strength.",
    },
    [Difficulty.Hard]: {
      label: "Hard",
      description:
        "Checking tower sight lines is no longer possible, enemies die slower and undiscovered nests gain strength more quickly",
    },
  };

const openSubMenu = ref(SubMenu.None);
const seed = ref("");
const seedInput = ref<HTMLElement | null>(null);
const difficulty = ref(Difficulty.Normal);

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

  props.onPlay(seed.value, difficulty.value);
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
  }

  select {
    height: 48px;
    font-size: 30px;
    text-align: center;
    font-family: JupiterCrash;
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
