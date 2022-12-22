import type { TutorialMessage } from "./messages";
import * as messages from "./messages";

const TUTORIALS: TutorialMessage[] = [
  messages.INTRO,
  messages.BUILD_TOWERS,
  messages.CHECK_COVERAGE,
  messages.START_WAVE,
  messages.EXPAND_RADIUS,
  messages.BUY_UPGRADE,
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
