import { Difficulty } from "../difficulty";
import { EventParamsMap, GameEvent } from "../events";
import Manager from "../controllers/manager";
import EventSystem from "../eventSystem";

export type TutorialMessage = (override: number) => Promise<number>;

const continueAfterEvent = <E extends GameEvent>(
  promise: Promise<number> | number,
  event: E,
  condition?: (...args: EventParamsMap[E]) => boolean | void
) => {
  return new Promise<void>((resolve) => {
    const removeEventListener = EventSystem.Instance.addEventListener(
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
    const removeEventListeners = EventSystem.Instance.addEventListeners(
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

const createTutorialMessage =
  (message: string, ...events: GameEvent[]): TutorialMessage =>
  (override) =>
    continueAfterEvents(
      Manager.Instance.showMessage(message, { override, expires: 0 }),
      events
    );

export const INTRO = createTutorialMessage(
  "Welcome to Open Tower Defense! Open the build menu by clicking the {key: 🔧} button or by pressing {key: b}",
  GameEvent.OpenBuildMenu
);

export const BUILD_TOWERS: TutorialMessage = (override) =>
  continueAfterEvent(
    Manager.Instance.showMessage(
      "Build towers and walls near your base to protect it from enemies lurking in undiscovered areas",
      { override, expires: 0 }
    ),
    GameEvent.SurfaceChange,
    ({ affectedTiles }) => !!affectedTiles.size
  );

export const CHECK_COVERAGE: TutorialMessage = (override) =>
  new Promise<number>((resolve) => {
    const difficulty = Manager.Instance.getDifficulty();
    if (difficulty === Difficulty.Hard) {
      resolve(override);
      return;
    }

    continueAfterEvents(
      Manager.Instance.showMessage(
        `Click the {key: 🎯} button to view tower sight lines${
          difficulty === Difficulty.Easy ? " and enemy paths" : " "
        } to check how effective your layout is`,
        { override, expires: 0 }
      ),
      [GameEvent.ToggleShowCoverage, GameEvent.StartWave]
    ).then(resolve);
  });

export const START_WAVE: TutorialMessage = (override) =>
  new Promise<number>((resolve) => {
    if (Manager.Instance.getIsStarted()) {
      continueAfterEvent(override, GameEvent.EndWave).then(resolve);
      return;
    }

    continueAfterEvent(
      Manager.Instance.showMessage(
        "Start the wave when you are ready. Good luck!",
        { override, expires: 0 }
      ),
      GameEvent.EndWave
    ).then(resolve);
  });

export const BUY_UPGRADE = createTutorialMessage(
  "After beating a wave you can unlock a new building in the build menu strengthen your defense, take a look!",
  GameEvent.OpenBuildMenu
);
