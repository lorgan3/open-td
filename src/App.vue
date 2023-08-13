<script setup lang="ts">
import { ref } from "vue";
import Game from "./components/Game.vue";
import MainMenu from "./components/MainMenu.vue";
import { Difficulty } from "./data/difficulty";
import { Constructor } from "./renderers/api";
import "./util/firebase";
import "./util/offscreenCanvas";

enum State {
  Menu,
  Game,
}

const state = ref(State.Menu);
const gameSeed = ref<string | null>();
const gameDifficulty = ref<Difficulty>();
const gameRenderer = ref<Constructor>();
const gameShowTutorial = ref<boolean>();
const gameSimulationSpeed = ref<number>();

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
};

const mainMenu = () => (state.value = State.Menu);
</script>

<template>
  <MainMenu v-if="state == State.Menu" :onPlay="startGame" />
  <Game
    v-if="state == State.Game"
    :seed="gameSeed!"
    :difficulty="gameDifficulty!"
    :renderer="gameRenderer!"
    :showTutorial="gameShowTutorial!"
    :initialSpeed="gameSimulationSpeed!"
    :mainMenu="mainMenu"
  />
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
