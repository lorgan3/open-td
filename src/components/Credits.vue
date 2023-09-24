<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";
import credits from "../../credits.json";

interface Credit {
  author?: string;
  authorUrl?: string;
  subjects: Array<{
    name: string;
    url?: string;
    license?: string;
    description?: string;
  }>;
}

defineProps<{
  onMainMenu: () => void;
}>();

const shownDescriptions = ref<Record<string, boolean>>({});
const list = ref<HTMLElement | null>(null);

const toggleDescription = (i: string) => {
  shownDescriptions.value[i] = !shownDescriptions.value[i];
};

let scrolledManually = false;
const handleWheel = () => {
  scrolledManually = true;
};

onMounted(() => {
  let previousTime: number;

  let overflow = 0;
  const scroll = (time: number) => {
    if (scrolledManually || !list.value) {
      return;
    }

    if (!previousTime) {
      previousTime = time;
      window.requestAnimationFrame(scroll);
      return;
    }

    const dt = time - previousTime;
    overflow += 5 / dt;
    list.value!.scrollTop += Math.floor(overflow);
    overflow %= 1;

    if (list.value!.scrollTop < list.value!.scrollHeight) {
      previousTime = time;
      window.requestAnimationFrame(scroll);
    }
  };

  list.value!.addEventListener("wheel", handleWheel);
  window.requestAnimationFrame(scroll);
});

onBeforeUnmount(() => {
  if (handleWheel) {
    list.value!.removeEventListener("wheel", handleWheel);
  }
});
</script>

<template>
  <div class="wrapper">
    <div class="wrapper-top">
      <h1>Credits</h1>
    </div>
    <ul class="credits-list" ref="list">
      <li v-for="(credit, i) in (credits as Credit[])" class="credit">
        <h3 v-if="credit.author">
          <a
            :is="credit.authorUrl ? 'a' : 'span'"
            :href="credit.authorUrl"
            target="_blank"
            rel="noreferrer noopener"
            >{{ credit.author }}</a
          >
        </h3>
        <ul>
          <li v-for="(subject, j) in credit.subjects" class="subject">
            <span class="subject-name">
              <a
                :is="credit.authorUrl ? 'a' : 'span'"
                :href="subject.url"
                target="_blank"
                rel="noreferrer noopener"
                >{{ subject.name }}</a
              >
              <span v-for="license in subject.license" class="badge">{{
                license
              }}</span>
              <button
                v-if="'description' in subject"
                class="more-details-button badge"
                @click="toggleDescription(`${i}-${j}`)"
              >
                More
              </button>
            </span>
            <textarea
              v-if="shownDescriptions[`${i}-${j}`]"
              class="description"
              disabled
              rows="10"
              cols="80"
            >
              {{ subject.description }}
            </textarea>
          </li>
        </ul>
      </li>
    </ul>
    <div class="wrapper-bottom">
      <button @click="onMainMenu" class="menu-button">Main menu</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: white;

  &-top {
    background: rgb(42 46 113);
    width: 100%;
    display: flex;
    justify-content: center;
  }

  &-bottom {
    background: rgb(21 22 46);
    width: 100%;
    display: flex;
    justify-content: center;
  }

  h1 {
    font-size: 84px;
    margin: 1vh 0;
  }

  .credits-list {
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 32px;
    padding: 0 30px;
    width: 100%;
    overflow: auto;
    box-sizing: border-box;
    background: linear-gradient(180deg, rgb(42 46 113) 0%, rgb(21 22 46) 100%);
    text-align: center;

    scrollbar-width: thin;
    scrollbar-color: #fff transparent;

    &::-webkit-scrollbar {
      width: 5px;
      background-color: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background: #fff;
    }

    &::before,
    &::after {
      content: "";
      left: 0px;
      right: 0;
      position: sticky;
    }

    &::before {
      top: 0px;
      box-shadow: 0px 0px 25px 40px rgb(42 46 113);
      border: 1px solid rgb(42 46 113);
    }

    &::after {
      bottom: 0px;
      box-shadow: 0px 0px 25px 40px rgb(21 22 46);
      border: 1px solid rgb(21 22 46);
    }
  }

  .credit {
    display: flex;
    flex-direction: column;
    align-items: center;

    &:first-child {
      margin-top: calc(100vh - 360px);
    }

    &:last-child {
      margin-bottom: calc(100vh - 310px);
    }

    h3,
    a {
      color: white;
      font-size: 24px;
      text-decoration: none;
    }

    h3,
    h3 a {
      font-size: 48px;
    }

    .subject {
      display: flex;
      flex-direction: column;

      &-name {
        display: flex;
        gap: 8px;
        align-items: baseline;
        justify-content: center;
      }
    }
  }

  .badge {
    font-size: 12px;
    background-color: rgb(44, 49, 120);
    padding: 5px;
    border-radius: 4px;
    border: 1px solid #000;
    color: white;
  }

  .more-details-button:hover {
    cursor: pointer;
    background-color: rgb(57, 63, 155);
  }

  .menu-button {
    margin: 5vh 0;
    width: 300px;
    height: 48px;
    box-sizing: border-box;
    font-size: 30px;
    text-align: center;
    font-family: JupiterCrash;
    flex-shrink: 0;
  }
}
</style>
