<template>
  <div class="key-grid">
    <slot></slot>
  </div>
</template>

<style lang="scss" scoped>
.key-grid {
  display: grid;
  grid-template-columns: 26px 26px 26px;
  grid-template-rows: auto;
  grid-gap: 4px;
  grid-template-areas:
    ". up ."
    "left down right";
}
</style>
