import type { TutorialMessage } from "./messages";
import * as messages from "./messages";

const TUTORIALS: TutorialMessage[] = [
  messages.INTRO,
  messages.BUILD_TOWERS,
  messages.CHECK_COVERAGE,
  messages.START_WAVE,
  messages.EXPAND_RADIUS,
  messages.BUY_UPGRADE,
  messages.CHOOSE_UPGRADE,
];

class TutorialManager {
  private promise?: Promise<number>;
  private reject?: () => void;
  private previousId = -1;

  async start() {
    this.promise = new Promise(async (resolve, reject) => {
      this.reject = reject;

      // Wait 1 tick for the promise variable to be set.
      await Promise.resolve();

      for (let i = 0; i < TUTORIALS.length; i++) {
        const tutorial = TUTORIALS[i];

        try {
          this.previousId = await Promise.race([
            tutorial(this.previousId),
            this.promise!,
          ]);
        } catch {
          // Tutorial was cancelled; stop the loop
          return;
        }
      }

      resolve(-1);
    });

    try {
      await this.promise;
    } catch {
      // Tutorial was cancelled
    }
  }

  stop() {
    this.reject?.();

    this.reject = undefined;
    this.promise = undefined;
  }

  get isStarted() {
    return !!this.promise;
  }
}

export default TutorialManager;
