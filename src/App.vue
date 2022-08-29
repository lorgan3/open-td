<script setup lang="ts">
import { ref } from "vue";
import Game from "./components/Game.vue";
import MainMenu from "./components/MainMenu.vue";

enum State {
  Menu,
  Game,
}

const state = ref(State.Menu);
const gameSeed = ref("");

const startGame = (seed: string) => {
  state.value = State.Game;
  gameSeed.value = seed;
};
</script>

<template>
  <MainMenu v-if="state == State.Menu" :onPlay="startGame" />
  <Game v-if="state == State.Game" :seed="gameSeed" />
</template>

<style>
#app {
  width: 100vw;
  height: 100vh;
}

/* http://meyerweb.com/eric/tools/css/reset/ 
   v2.0 | 20110126
   License: none (public domain)
*/
html, body, div, span, applet, object, iframe,
h1, h2, h3, h4, h5, h6, p, blockquote, pre,
a, abbr, acronym, address, big, cite, code,
del, dfn, em, img, ins, kbd, q, s, samp,
small, strike, strong, sub, sup, tt, var,
b, u, i, center,
dl, dt, dd, ol, ul, li,
fieldset, form, label, legend,
table, caption, tbody, tfoot, thead, tr, th, td,
article, aside, canvas, details, embed, 
figure, figcaption, footer, header, hgroup, 
menu, nav, output, ruby, section, summary,
time, mark, audio, video {
	margin: 0;
	padding: 0;
	border: 0;
	font-size: 100%;
	font: inherit;
	vertical-align: baseline;
}
ol, ul {
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
