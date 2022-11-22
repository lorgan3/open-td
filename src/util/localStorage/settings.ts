import { Difficulty } from "../../data/difficulty";
import { Constructor } from "../../renderers/api";
import EmojiRenderer from "../../renderers/emojiRenderer/renderer";
import PixiRenderer from "../../renderers/pixiRenderer/renderer";
import { assertValue, getKey } from "../object";

export interface Settings {
  renderer: Constructor;
  difficulty: Difficulty;
}

const RENDERER_MAP = {
  emojiRenderer: EmojiRenderer as Constructor,
  pixiRenderer: PixiRenderer as Constructor,
};

// In an ideal world this returns `Settings[K]` but typescript doesn't understand
export const settingsReviver = <K extends keyof Settings>(
  key: K,
  value: any
): any => {
  if (key === "renderer") {
    if (value in RENDERER_MAP) {
      return RENDERER_MAP[value as keyof typeof RENDERER_MAP];
    }

    return RENDERER_MAP["emojiRenderer"];
  }

  if (key === "difficulty") {
    return assertValue(Difficulty, value);
  }

  return value;
};

export const settingsReplacer = <K extends keyof Settings>(
  key: K,
  value: Settings[K]
): any => {
  if (key === "renderer") {
    return getKey(RENDERER_MAP, value as Constructor, "emojiRenderer");
  }

  return value;
};
