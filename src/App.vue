<script setup lang="ts">
import { ref } from "vue";
import Game from "./components/Game.vue";
import MainMenu from "./components/MainMenu.vue";
import { Difficulty } from "./data/difficulty";
import { Constructor } from "./renderers/api";
import "./util/firebase";
import Credits from "./components/Credits.vue";
import { get } from "./util/localStorage";
import PixiRenderer from "./renderers/pixiRenderer/renderer";

import { Sound } from "./renderers/pixiRenderer/sound";
import { getAssets } from "./renderers/pixiRenderer/assets";
import MusicController from "./renderers/pixiRenderer/sound/musicController";

enum State {
  Menu = "menu",
  Game = "game",
  Credits = "credits",
}

if (!MusicController.Instance) {
  new MusicController();
}

const url = new URL(window.location.href);
const hash = url.hash.slice(1);
const state = ref(
  Object.values<string>(State).includes(hash) ? hash : State.Menu
);
const storedData = get("settings");

if (state.value === State.Menu || state.value === State.Credits) {
  getAssets().then(() => {
    MusicController.Instance.updateVolume(
      (storedData?.musicVolume ?? 66) / 100
    );
    MusicController.Instance.queue([Sound.TitleMusic]);
  });
}

const gameSeed = ref<string | null>();
const gameDifficulty = ref<Difficulty>(
  storedData?.difficulty || Difficulty.Easy
);
const gameRenderer = ref<Constructor>(storedData?.renderer || PixiRenderer);
const gameShowTutorial = ref<boolean>(storedData?.showTutorial || true);
const gameSimulationSpeed = ref<number>(storedData?.simulation || 1);

const startGame = (
  seed: string | null,
  difficulty: Difficulty,
  renderer: Constructor,
  showTutorial: boolean,
  simulationSpeed: number
) => {
  state.value = State.Game;
  gameSeed.value = seed;
  gameDifficulty.value = difficulty;
  gameRenderer.value = renderer;
  gameShowTutorial.value = showTutorial;
  gameSimulationSpeed.value = simulationSpeed;

  MusicController.Instance.queue([Sound.ForHonor]);
};

const mainMenu = () => {
  state.value = State.Menu;
  MusicController.Instance.queue([Sound.TitleMusic]);
};

const credits = () => {
  state.value = State.Credits;
  MusicController.Instance.queue([Sound.TitleMusic]);
};
</script>

<template>
  <MainMenu
    v-if="state == State.Menu"
    :onPlay="startGame"
    :onCredits="credits"
  />
  <Game
    v-if="state == State.Game"
    :seed="gameSeed!"
    :difficulty="gameDifficulty!"
    :renderer="gameRenderer!"
    :showTutorial="gameShowTutorial!"
    :initialSpeed="gameSimulationSpeed!"
    :onMainMenu="mainMenu"
  />
  <Credits v-if="state == State.Credits" :onMainMenu="mainMenu" />
</template>

<style>
@font-face {
  /* https://www.1001freefonts.com/jupiter-crash.font */
  font-family: JupiterCrash;
  src: url(./assets/jupiterc.ttf);
}

#app {
  width: 100vw;
  height: 100vh;
  font-family: JupiterCrash;
  font-size: 24px;
  overflow: hidden;
}

button {
  font-family: JupiterCrash;
  font-size: 24px;
  color: #000;

  &:disabled {
    color: rgba(16, 16, 16, 0.3);
  }
}

/** Could not get media queries to work in the component */
@media (max-aspect-ratio: 1/1) {
  .marketplace {
    .inner {
      flex-direction: column-reverse;

      .detail {
        max-width: calc(100% - 24px);
        min-height: 300px;
        padding-left: 12px;

        .detail-summary {
          flex-direction: column;
        }
      }

      .menu {
        width: 100%;
        border-top: 2px solid #fff;

        .title {
          max-width: 35%;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }
}

/* http://meyerweb.com/eric/tools/css/reset/
   v2.0 | 20110126
   License: none (public domain)
*/
html,
body,
div,
span,
applet,
object,
iframe,
h1,
h2,
h3,
h4,
h5,
h6,
p,
blockquote,
pre,
a,
abbr,
acronym,
address,
big,
cite,
code,
del,
dfn,
em,
img,
ins,
kbd,
q,
s,
samp,
small,
strike,
strong,
sub,
sup,
tt,
var,
b,
u,
i,
center,
dl,
dt,
dd,
ol,
ul,
li,
fieldset,
form,
label,
legend,
table,
caption,
tbody,
tfoot,
thead,
tr,
th,
td,
article,
aside,
canvas,
details,
embed,
figure,
figcaption,
footer,
header,
hgroup,
menu,
nav,
output,
ruby,
section,
summary,
time,
mark,
audio,
video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}
ol,
ul {
  list-style: none;
}
table {
  border-collapse: collapse;
  border-spacing: 0;
}

/* */
h3 {
  font-size: 18px;
  font-weight: bold;
}
</style>
