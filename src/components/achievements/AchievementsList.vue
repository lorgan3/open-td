<script setup lang="ts">
import { getAchievements } from "../../data/achievement";
import AchievementComponent from "./Achievement.vue";

const achievements = getAchievements();
</script>

<template>
  <AchievementComponent
    v-for="achievement in achievements"
    :achievement="achievement"
  />
</template>

<style lang="scss" scoped></style>
