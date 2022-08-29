<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  onPlay: (seed: string) => void;
}>();

const showInput = ref(false);
const seed = ref("");
const seedInput = ref<HTMLElement | null>(null);

const onClick = () => {
  showInput.value = !showInput.value;

  if (showInput.value) {
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
    <h1>Open TD 🗼</h1>

    <div class="menu">
      <div class="menu-main">
        <div class="menu-main-inner">
          <button @click="onClick">Play</button>
          <button disabled>How to play</button>
          <button disabled>Settings</button>
        </div>
      </div>
      <div :class="{ 'menu-play': true, 'menu--hidden': !showInput }">
        <form @submit="submit" class="menu-play-inner">
          <h3>Which planet?</h3>
          <input ref="seedInput" v-model="seed" />
          <button type="submit">Go!</button>
        </form>
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
    font-size: 10vh;
    text-align: center;
    color: #fff;
  }

  h3 {
    font-size: 24px;
    text-align: center;
    color: #fff;
  }

  button,
  input {
    width: 100%;
    height: 48px;
    box-sizing: border-box;
    font-size: 24px;
    text-align: center;
  }

  .menu {
    display: flex;
    flex-direction: row;
    height: 50vh;

    > * {
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
    &-play {
      &-inner {
        width: 300px;
        padding: 0 20px;

        display: flex;
        flex-direction: column;
        gap: 20px;
      }
    }

    &-play {
      margin: -2px;
    }
  }
}
</style>
