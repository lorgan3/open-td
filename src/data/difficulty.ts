export enum Difficulty {
  Easy = "easy",
  Normal = "normal",
  Hard = "hard",
}

export const difficulties: Record<
  Difficulty,
  { label: string; description: string }
> = {
  [Difficulty.Easy]: {
    label: "Easy",
    description:
      "Allows checking which tiles are covered by tower sight lines. Shows the approximate path enemies will take and undiscovered nests do not become stronger.",
  },
  [Difficulty.Normal]: {
    label: "Normal",
    description:
      "Allows checking which tiles are covered by tower sight lines. Enemies are a bit stronger and undiscovered nests slowly gain more strength.",
  },
  [Difficulty.Hard]: {
    label: "Hard",
    description:
      "Checking tower sight lines is no longer possible, enemies are stronger and undiscovered nests gain strength more quickly",
  },
};
