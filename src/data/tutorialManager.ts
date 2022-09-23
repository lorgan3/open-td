import { GameEvent } from "./events";
import Manager from "./manager";

const TUTORIALS: Array<(override: number) => Promise<number>> = [
  () =>
    new Promise<number>((resolve) => {
      Manager.Instance.showMessage(
        "Welcome to Open Tower Defense! Open the build menu by clicking the {key: 🔧} button or by pressing {key: b}",
        { closable: false }
      ).then(resolve);
    }),
  (override) =>
    new Promise<number>((resolve) => {
      const removeEventListener = Manager.Instance.addEventListener(
        GameEvent.OpenBuildMenu,
        () => {
          removeEventListener();
          Manager.Instance.showMessage(
            "Build towers and walls near your base to protect it from enemies lurking in undiscovered areas",
            { override }
          ).then(resolve);
        }
      );
    }),
  (override) =>
    new Promise<number>((resolve) => {
      const removeEventListener = Manager.Instance.addEventListener(
        GameEvent.SurfaceChange,
        ({ affectedTiles }) => {
          if (!affectedTiles.size) {
            return;
          }

          removeEventListener();
          Manager.Instance.showMessage(
            "Start the wave when you are ready. Good luck!",
            { override }
          ).then(resolve);
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
