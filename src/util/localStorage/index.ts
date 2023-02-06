import { achievementsReplacer, achievementsReviver } from "./achievements";
import { settingsReplacer, settingsReviver } from "./settings";
import { Items, Replacer, Reviver } from "./types";

const REVIVERS_MAP: Record<keyof Items, Reviver> = {
  settings: settingsReviver,
  achievements: achievementsReviver,
};

const REPLACER_MAP: Record<keyof Items, Replacer> = {
  settings: settingsReplacer,
  achievements: achievementsReplacer,
};

export const get = <K extends keyof Items>(key: K): Items[K] | null => {
  let json: string | null;

  try {
    json = localStorage.getItem(key);
  } catch (error) {
    return null;
  }

  if (!json) {
    return null;
  }

  if (!json.startsWith("{")) {
    json = window.atob(json);
  }

  try {
    return JSON.parse(json, REVIVERS_MAP[key]);
  } catch (error) {
    return null;
  }
};

export const set = <K extends keyof Items>(
  key: K,
  data: Partial<Items[K]>,
  hashed = false
) => {
  const original = get(key) || {};
  const json = JSON.stringify({ ...original, ...data }, REPLACER_MAP[key]);

  try {
    localStorage.setItem(key, hashed ? window.btoa(json) : json);
  } catch (error) {
    console.warn("Failed to store data", error);
  }
};
