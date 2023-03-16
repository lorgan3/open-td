import { Difficulty } from "../../data/difficulty";
import { Constructor } from "../../renderers/api";
import EmojiRenderer from "../../renderers/emojiRenderer/renderer";
import PixiRenderer from "../../renderers/pixiRenderer/renderer";
import { assertNumber } from "../number";
import { assertValue, Bool, getKey } from "../object";

export interface Settings {
  renderer: Constructor;
  difficulty: Difficulty;
  showTutorial: boolean;
  volume: number;
  simulation: number;
}

// In an ideal world this returns `Settings[K]` but typescript doesn't understand
export const settingsReviver = <K extends keyof Settings>(
  key: K,
  value: any
): any => {
  if (key === "renderer") {
    const rendererMap = {
      emojiRenderer: EmojiRenderer as Constructor,
      pixiRenderer: PixiRenderer as Constructor,
    };

    if (value in rendererMap) {
      return rendererMap[value as keyof typeof rendererMap];
    }

    return rendererMap["pixiRenderer"];
  }

  if (key === "difficulty") {
    return assertValue(Difficulty, value);
  }

  if (key === "showTutorial") {
    return assertValue(Bool, value);
  }

  if (key === "volume") {
    return assertNumber(value, 0, 100);
  }

  if (key === "simulation") {
    return assertNumber(value, 1, 3);
  }

  return value;
};

export const settingsReplacer = <K extends keyof Settings>(
  key: K,
  value: Settings[K]
): any => {
  if (key === "renderer") {
    const rendererMap = {
      emojiRenderer: EmojiRenderer as Constructor,
      pixiRenderer: PixiRenderer as Constructor,
    };

    return getKey(rendererMap, value as Constructor, "pixiRenderer");
  }

  return value;
};
