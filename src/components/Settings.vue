<script setup lang="ts">
import { ref } from "vue";
import { Constructor } from "../renderers/api";
import EmojiRenderer from "../renderers/emojiRenderer/renderer";
import PixiRenderer from "../renderers/pixiRenderer/renderer";
import { get } from "../util/localStorage";
import { Settings } from "../util/localStorage/settings";

const { setSubmitter } = defineProps<{
  setSubmitter: (submitter: () => Partial<Settings>) => void;
}>();

const renderOptions: Array<{ label: string; value: Constructor }> = [
  {
    label: "Pixi renderer",
    value: PixiRenderer,
  },
  {
    label: "Emoji renderer",
    value: EmojiRenderer,
  },
];

const storedData = get("settings");

const renderer = ref(
  (storedData &&
    renderOptions.find(({ value }) => value === storedData.renderer)) ||
    renderOptions[0]
);
const showTutorial = ref(storedData?.showTutorial ?? true);
const volume = ref(storedData?.volume ?? 50);

const submit = () => {
  return {
    ...storedData,
    renderer: renderer.value.value,
    showTutorial: showTutorial.value,
    volume: volume.value,
  };
};

setSubmitter(submit);
</script>

<template>
  <label class="horizontal">
    Renderer
    <select v-model="renderer">
      <option v-for="option in renderOptions" :value="option">
        {{ option.label }}
      </option>
    </select>
  </label>
  <label class="horizontal">
    Show tutorial
    <input type="checkbox" v-model="showTutorial" />
  </label>
  <label class="horizontal">
    Volume
    <input type="range" min="0" max="100" v-model="volume" />
  </label>
</template>

<style lang="scss" scoped>
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

input[type="checkbox"] {
  width: 24px;
  height: 24px;
  margin: 0;
}

input[type="range"] {
  height: auto;
  flex: 1;
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
</style>
