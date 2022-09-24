import { EventParamsMap, GameEvent } from "../events";
import Manager, { Difficulty } from "../manager";

export type TutorialMessage = (override: number) => Promise<number>;

const continueAfterEvent = <E extends GameEvent>(
  promise: Promise<number> | number,
  event: E,
  condition?: (...args: EventParamsMap[E]) => boolean | void
) => {
  return new Promise<void>((resolve) => {
    const removeEventListener = Manager.Instance.addEventListener(
      event,
      (...args) => {
        if (!condition || condition(...args)) {
          removeEventListener();
          resolve();
        }
      }
    );
  }).then(() => promise);
};

const continueAfterEvents = (
  promise: Promise<number> | number,
  events: GameEvent[],
  condition?: (args: any) => boolean | void
) => {
  return new Promise<void>((resolve) => {
    const removeEventListeners = Manager.Instance.addEventListeners(
      events,
      (args) => {
        if (!condition || condition(args)) {
          removeEventListeners();
          resolve();
        }
      }
    );
  }).then(() => promise);
};

export const INTRO: TutorialMessage = () =>
  new Promise<number>((resolve) => {
    const promise = Manager.Instance.showMessage(
      "Welcome to Open Tower Defense! Open the build menu by clicking the {key: 🔧} button or by pressing {key: b}"
    );

    continueAfterEvent(promise, GameEvent.OpenBuildMenu).then(resolve);
  });

export const BUILD_TOWERS: TutorialMessage = (override) =>
  new Promise<number>((resolve) => {
    const promise = Manager.Instance.showMessage(
      "Build towers and walls near your base to protect it from enemies lurking in undiscovered areas",
      { override }
    );

    continueAfterEvent(
      promise,
      GameEvent.SurfaceChange,
      ({ affectedTiles }) => !!affectedTiles.size
    ).then(resolve);
  });

export const CHECK_COVERAGE: TutorialMessage = (override) =>
  new Promise<number>((resolve) => {
    const difficulty = Manager.Instance.getDifficulty();
    if (difficulty === Difficulty.Hard) {
      resolve(override);
      return;
    }

    const promise = Manager.Instance.showMessage(
      `Click the {key: 🎯} button to view tower sight lines${
        difficulty === Difficulty.Easy ? " and enemy paths" : " "
      } to check how effective your layout is`,
      { override }
    );

    continueAfterEvents(promise, [
      GameEvent.ToggleShowCoverage,
      GameEvent.StartWave,
    ]).then(resolve);
  });

export const START_WAVE: TutorialMessage = (override) =>
  new Promise<number>((resolve) => {
    if (Manager.Instance.getIsStarted()) {
      continueAfterEvent(override, GameEvent.EndWave).then(resolve);
      return;
    }

    const promise = Manager.Instance.showMessage(
      "Start the wave when you are ready. Good luck!",
      { override }
    );

    continueAfterEvent(promise, GameEvent.EndWave).then(resolve);
  });

export const BUY_UPGRADE: TutorialMessage = (override) =>
  new Promise<number>((resolve) => {
    const promise = Manager.Instance.showMessage(
      "After beating a wave you can unlock a new building in the build menu strengthen your defense, take a look!",
      { override }
    );

    continueAfterEvent(promise, GameEvent.OpenBuildMenu).then(resolve);
  });
