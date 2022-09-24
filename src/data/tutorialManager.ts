import { GameEvent } from "./events";
import Manager, { Difficulty } from "./manager";

const TUTORIALS: Array<(override: number) => Promise<number>> = [
  () =>
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
    }),
  (override) =>
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
    }),
  (override) =>
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
    }),
  (override) =>
    new Promise<number>((resolve) => {
      if (Manager.Instance.getIsStarted()) {
        resolve(override);
        return;
      }

      Manager.Instance.showMessage(
        "Start the wave when you are ready. Good luck!",
        { override }
      ).then(resolve);
    }),
  (override) =>
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
    }),
];

class TutorialManager {
  private promise?: Promise<void>;
  private reject?: () => void;
  private previousId = -1;

  async start() {
    this.promise = new Promise(async (resolve, reject) => {
      this.reject = reject;

      for (let i = 0; i < TUTORIALS.length; i++) {
        const tutorial = TUTORIALS[i];

        this.previousId = await tutorial(this.previousId);
      }

      resolve();
    });

    await this.promise;
  }

  stop() {
    this.reject?.();
  }
}

export default TutorialManager;
