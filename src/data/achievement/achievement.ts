import { set } from "../../util/localStorage";
import EventSystem from "../eventSystem";
import md5 from "md5";
import { GameEvent } from "../events";
import Manager from "../controllers/manager";

export interface AchievementDefinition {
  description: string;
  thresholds: Record<string, string>;
  getProgress: (this: Achievement, data: unknown) => number;
  triggers: GameEvent[];
}

export class Achievement {
  private removeEventListeners?: () => void;

  private done = false;
  private steps: number[];
  private highestProgress = 0;
  public data: Record<string, any> = {};
  private initialProgress = 0;

  constructor(private definition: AchievementDefinition, private progress = 0) {
    this.initialProgress = progress;
    this.steps = Object.keys(this.definition.thresholds).map((step) =>
      parseFloat(step)
    );

    this.updateProgress();
  }

  get title() {
    return Object.values(this.definition.thresholds)[
      this.steps.indexOf(this.highestProgress)
    ];
  }

  get description() {
    return this.definition.description;
  }

  get thresholds() {
    return this.definition.thresholds;
  }

  get stepValues() {
    return this.steps;
  }

  get isDone() {
    return this.done;
  }

  get internalProgress() {
    return this.progress;
  }

  get completedThresholds() {
    return this.steps.indexOf(this.highestProgress);
  }

  get percentage() {
    const max = this.steps.at(-1)!;
    return this.progress / max;
  }

  getPercentageForThreshold(threshold: string) {
    const value = parseFloat(threshold);
    const previousValue = this.steps[this.steps.indexOf(value) - 1] ?? 0;
    return Math.min(
      Math.max(this.progress - previousValue, 0) / (value - previousValue),
      1
    );
  }

  register() {
    this.removeEventListeners = EventSystem.Instance.addEventListeners(
      this.definition.triggers,
      this.process
    );
  }

  unRegister() {
    this.removeEventListeners?.();
  }

  private updateProgress() {
    for (let i = 0; i < this.steps.length; i++) {
      if (this.progress >= this.steps[i]) {
        this.highestProgress = this.steps[i];

        if (i === this.steps.length - 1) {
          this.done = true;
        }
      } else {
        break;
      }
    }
  }

  private process = (data: unknown) => {
    const oldProgress = Math.max(this.progress, this.initialProgress);
    this.progress = Math.max(
      this.definition.getProgress.call(this, data),
      this.progress
    );

    if (this.isDone) {
      return;
    }

    this.updateProgress();

    if (this.highestProgress > oldProgress) {
      Manager.Instance.showMessage(
        `🏆 Achievement unlocked!\n${this.title} - ${this.description}`
      );

      set(
        "achievements",
        { [md5(this.definition.description)]: this.highestProgress },
        true
      );
    }
  };
}
