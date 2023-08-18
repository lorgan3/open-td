<script setup lang="ts">
import { ref, watch } from "vue";
import Key from "./Key.vue";
import Mouse from "./mouse.vue";
import { IconType } from "../hud/constants";
import Icon from "../hud/Icon.vue";

const props = defineProps<{
  text: string;
}>();

const buttonMap = { 0: "left", 1: "right", 3: "middle" } as any;

const left = ref(props.text);
const control = ref("");
const type = ref("");
const right = ref("");

watch(
  () => props.text,
  (newText) => {
    const regex =
      /^(?<left>.*?)?{(?<control>key|mouse|icon): (?<type>.*?)}(?<right>.*)$/s;
    const result = regex.exec(newText);
    if (result) {
      left.value = result.groups!.left;
      control.value = result.groups!.control;
      type.value = result.groups!.type;
      right.value = result.groups!.right;
    } else {
      left.value = newText;
      control.value = "";
      type.value = "";
      right.value = "";
    }
  },
  { immediate: true }
);
</script>

<template>
  {{ left }}
  <Key v-if="control === 'key'" :char="type" />
  <Mouse v-if="control === 'mouse'" :button="buttonMap[type]" />
  <Icon
    v-if="control === 'icon'"
    :type="(IconType[type as keyof typeof IconType] )"
  />
  <TextWithControls v-if="right" :text="right" />
</template>
