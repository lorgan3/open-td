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
  "Welcome to Open Tower Defense! Open the build menu by pressing {key: e}. You can also quickly select the most basic tower by pressing {key: f}.",
  GameEvent.OpenBuildMenu,
  GameEvent.StartWave
);

export const BUILD_TOWERS: TutorialMessage = (override) =>
  new Promise<number>((resolve) => {
    if (Manager.Instance.getIsStarted()) {
      continueAfterEvent(override, GameEvent.EndWave).then(resolve);
      return;
    }

    continueAfterEvent(
      Manager.Instance.showMessage(
        "Here you can choose which defenses to build. Consider picking the basic tower to beat the first wave. Towers in the 2nd and 3rd row can be unlocked later in the game.",
        { override, expires: 0 }
      ),
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

    continueAfterEvents(
      Manager.Instance.showMessage(
        `If you're new to the game you can click the {icon: Radar} button to view tower sight lines${
          difficulty === Difficulty.Easy || difficulty === Difficulty.Practice
            ? " and enemy paths"
            : " "
        } to check how effective your layout is.`,
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

export const EXPAND_RADIUS = createTutorialMessage(
  "Good job defeating the first wave! Things will quickly become more difficult from here on out! After every wave your visible radius will increase. When enemy spawn points are discovered they are disabled and you receive a point to unlock new technologies.",
  GameEvent.Discover
);

export const BUY_UPGRADE = createTutorialMessage(
  "You gained a wave point by discovering a spawn point! Open the build menu in order to spend it.",
  GameEvent.OpenBuildMenu
);

export const CHOOSE_UPGRADE = createTutorialMessage(
  "There are both defensive and offensive upgrades, read the descriptions to understand their strengths! You can also trade wave points for bonuses in the last column.",
  GameEvent.CloseBuildMenu
);
