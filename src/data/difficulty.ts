export enum Difficulty {
  Practice = "practice",
  Easy = "easy",
  Normal = "normal",
  Hard = "hard",
}

export const difficulties: Record<
  Difficulty,
  { label: string; description: string }
> = {
  [Difficulty.Practice]: {
    label: "Practice",
    description:
      "Like easy mode but with infinite money. Great for getting to know the game mechanics but achievements are disabled.",
  },
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
      "Checking tower sight lines is no longer possible, enemies are stronger and undiscovered nests gain strength more quickly.",
  },
};
