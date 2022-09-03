<script setup lang="ts">
import Key from "./Key.vue";
import Mouse from "./mouse.vue";

const props = defineProps<{
  text: string;
}>();

const buttonMap = { 0: "left", 1: "right", 3: "middle" } as any;

const regex = /^(?<left>.*?){(?<control>key|mouse): (?<type>.)}(?<right>.*)$/;
const result = regex.exec(props.text);

let left = props.text;
let control: string, type: string, right: string;
if (result) {
  left = result.groups!.left;
  control = result.groups!.control;
  type = result.groups!.type;
  right = result.groups!.right;
}
</script>

<template>
  {{ left }}
  <Key v-if="control === 'key'" :char="type" />
  <Mouse v-if="control === 'mouse'" :button="buttonMap[type]" />
  <TextWithControls v-if="right" :text="right" />
</template>
