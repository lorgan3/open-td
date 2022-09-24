import { GameEvent } from "../events";
import Manager, { Difficulty } from "../manager";

export type TutorialMessage = (override: number) => Promise<number>;

export const INTRO: TutorialMessage = () =>
  new Promise<number>((resolve) => {
    const promise = Manager.Instance.showMessage(
      "Welcome to Open Tower Defense! Open the build menu by clicking the {key: 🔧} button or by pressing {key: b}"
    );

    const removeEventListener = Manager.Instance.addEventListener(
      GameEvent.OpenBuildMenu,
      () => {
        removeEventListener();
        promise.then(resolve);
      }
    );
  });

export const BUILD_TOWERS: TutorialMessage = (override) =>
  new Promise<number>((resolve) => {
    const promise = Manager.Instance.showMessage(
      "Build towers and walls near your base to protect it from enemies lurking in undiscovered areas",
      { override }
    );

    const removeEventListener = Manager.Instance.addEventListener(
      GameEvent.SurfaceChange,
      ({ affectedTiles }) => {
        if (!affectedTiles.size) {
          return;
        }

        removeEventListener();
        promise.then(resolve);
      }
    );
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

    const removeEventListeners = Manager.Instance.addEventListeners(
      [GameEvent.ToggleShowCoverage, GameEvent.StartWave],
      () => {
        removeEventListeners();
        promise.then(resolve);
      }
    );
  });

export const START_WAVE: TutorialMessage = (override) =>
  new Promise<number>((resolve) => {
    if (Manager.Instance.getIsStarted()) {
      resolve(override);
      return;
    }

    Manager.Instance.showMessage(
      "Start the wave when you are ready. Good luck!",
      { override }
    ).then(resolve);
  });

export const BUY_UPGRADE: TutorialMessage = (override) =>
  new Promise<number>((resolve) => {
    let removeEventListener = Manager.Instance.addEventListener(
      GameEvent.EndWave,
      () => {
        removeEventListener();

        const promise = Manager.Instance.showMessage(
          "After beating a wave you can unlock a new building in the build menu strengthen your defense, take a look!",
          { override }
        );

        removeEventListener = Manager.Instance.addEventListener(
          GameEvent.OpenBuildMenu,
          () => {
            removeEventListener();
            promise.then(resolve);
          }
        );
      }
    );
  });
