<script setup lang="ts">
import { Achievement } from "../../data/achievement/achievement";

const UNKNOWN = "???????";

const { achievement } = defineProps<{
  achievement: Achievement;
}>();

const formatter = Intl.NumberFormat(undefined, {
  style: "percent",
  maximumFractionDigits: 0,
});

const max = achievement.stepValues.at(-1)!;
const percentage = achievement.percentage;
</script>

<template>
  <div
    :class="{ achievement: true, 'achievement--complete': achievement.isDone }"
  >
    <h2 class="achievement-title">
      {{ achievement.title ?? UNKNOWN }}
    </h2>
    <p class="achievement-description">{{ achievement.description }}</p>
    <div
      class="achievement-progress"
      v-if="achievement.stepValues.length > 1 || max !== 1"
    >
      <span class="achievement-line">
        <span class="achievement-line-nominal" :style="{ flex: max }">
          <span
            v-for="(name, value) in achievement.thresholds"
            :class="{
              'achievement-line-segment': true,
            }"
            :style="{
              '--progress': `${
                achievement.getPercentageForThreshold(value) * 100
              }%`,
            }"
            :title="
              achievement.internalProgress >= parseFloat(value)
                ? name
                : achievement.internalProgress.toFixed()
            "
          >
            <span class="line"></span>
            <span class="marker">{{ value }}</span>
          </span>
        </span>
        <span
          class="achievement-line-overflow"
          :style="{ flex: achievement.internalProgress - max }"
          v-if="achievement.internalProgress > max"
        >
          <span class="achievement-line-segment">
            <span class="line"></span>
          </span>
        </span>
      </span>
      <p class="achievement-percentage">
        {{
          percentage > 1
            ? achievement.internalProgress
            : formatter.format(percentage)
        }}
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.achievement {
  background: #eee;
  border-radius: 3px;
  padding: 12px;
  position: relative;
  overflow: hidden;
  flex-shrink: 0;

  &--complete {
    background: rgb(218, 213, 155);

    &:before {
      content: "";
      position: absolute;
      width: 100px;
      height: 100%;
      background-image: linear-gradient(
        120deg,
        rgba(255, 255, 255, 0) 30%,
        rgba(255, 255, 255, 0.8),
        rgba(255, 255, 255, 0) 70%
      );
      top: 0;
      left: -100px;
      animation: shine 3s infinite linear;
    }
  }

  &-description {
    color: #555;
    font-size: 18px;
  }

  &-progress {
    margin-top: 12px;
    display: flex;
    flex-direction: row;
    gap: 6px;
    align-items: center;
  }

  &-line {
    display: flex;
    flex-direction: row;
    gap: 2px;
    flex: 1;

    &-nominal,
    &-overflow {
      display: flex;
      flex-direction: row;
      gap: 2px;
    }

    &-segment {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 15px;

      .line {
        display: block;
        height: 4px;
        width: 100%;
        background: linear-gradient(
          to right,
          rgb(218, 160, 13) var(--progress),
          #999 var(--progress)
        );
      }

      .marker {
        color: #555;
        font-size: 12px;
        align-self: flex-end;
      }
    }

    &-overflow {
      .achievement-line-segment {
        .line {
          background: rgb(174, 126, 7);
        }
      }
    }
  }
}

@keyframes shine {
  0% {
    left: -100px;
  }
  20% {
    left: 100%;
  }
  100% {
    left: 100%;
  }
}
</style>
