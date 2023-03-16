<script setup lang="ts">
import Settings from "./../Settings.vue";
import { Settings as ISettings } from "../../util/localStorage/settings";
import { set } from "../../util/localStorage";
import { Constructor } from "../../renderers/api";

const { visible, mainMenu, resume } = defineProps<{
  visible: boolean;
  mainMenu: () => void;
  resume: (
    renderer?: Constructor,
    showTutorial?: boolean,
    newSpeed?: number
  ) => void;
}>();

let getSettings: () => Partial<ISettings>;
const setSubmitter = (submit: typeof getSettings) => (getSettings = submit);

const handleResume = () => {
  const settings = getSettings();
  set("settings", settings);
  resume(settings.renderer, settings.showTutorial, settings.simulation);
};
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
      <button @click="mainMenu">Main menu</button>
      <span class="divider"></span>
      <Settings :setSubmitter="setSubmitter" />
      <button @click="handleResume">Save and resume</button>
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
  max-height: calc(100% - 100px);
  transition: transform 0.5s;
  transform: translateY(100vh);
  background: rgb(59, 77, 152);
  border: 2px solid #000;
  border-radius: 3px;
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

  h3 {
    font-size: 30px;
    text-align: center;
    color: #fff;
  }

  button {
    width: 100%;
    height: 48px;
    box-sizing: border-box;
    font-size: 30px;
    text-align: center;
    font-family: JupiterCrash;
    flex-shrink: 0;
  }

  .divider {
    border: 1px solid #fff;
  }
}
</style>
