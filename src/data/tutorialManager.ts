import { GameEvent } from "./events";
import Manager from "./manager";

const TUTORIALS = [
  () =>
    new Promise<void>((resolve) => {
      Manager.Instance.showMessage(
        "Welcome to Open Tower Defense! Open the build menu by clicking the center-right button or by pressing {key: b}",
        { closable: false, override: true }
      );

      resolve();
    }),
  () =>
    new Promise<void>((resolve) => {
      const removeEventListener = Manager.Instance.addEventListener(
        GameEvent.OpenBuildMenu,
        () => {
          removeEventListener();
          Manager.Instance.showMessage(
            "Build towers and walls near your base to protect it from enemies lurking in undiscovered areas",
            { override: true }
          );

          resolve();
        }
      );
    }),
  () =>
    new Promise<void>((resolve) => {
      const removeEventListener = Manager.Instance.addEventListener(
        GameEvent.SurfaceChange,
        ({ affectedTiles }) => {
          if (!affectedTiles.length) {
            return;
          }

          removeEventListener();
          Manager.Instance.showMessage(
            "Start the wave when you are ready. Good luck!",
            { override: true }
          );

          resolve();
        }
      );
    }),
];

class TutorialManager {
  private promise?: Promise<void>;
  private reject?: () => void;

  async start() {
    this.promise = new Promise(async (resolve, reject) => {
      this.reject = reject;

      for (let i = 0; i < TUTORIALS.length; i++) {
        const tutorial = TUTORIALS[i];

        await tutorial();
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
