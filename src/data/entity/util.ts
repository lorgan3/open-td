import Tile, { TileType } from "../terrain/tile";

export const getPathSection = (
  path: Tile[],
  index: number,
  speed: number,
  speedMultiplier: Partial<Record<TileType, number>> = {}
) => {
  const step = index % 1;
  const start = index | 0;
  const from = path[start];

  let end = (index + speed / (speedMultiplier[from.getType()] ?? 1)) | 0;
  if (start === end) {
    end++;
  }
  if (end >= path.length - 1) {
    end = path.length - 1;
  }
  const to = path[end];

  return { from, to, step };
};

export const getFuturePosition = (
  path: Tile[],
  currentIndex: number,
  time: number,
  speed: number,
  speedMultiplier: Partial<Record<TileType, number>> = {}
): number => {
  while (time > 0) {
    const remaining = 1 - (currentIndex % 1);
    const duration =
      (remaining / speed) *
      (speedMultiplier[path[currentIndex | 0].getType()] ?? 1);

    if (time > duration) {
      currentIndex += remaining;
      time -= duration;
    } else {
      currentIndex += (remaining * time) / duration;
      time = 0;
    }

    if (currentIndex >= path.length - 1) {
      return path.length - 1;
    }
  }

  return currentIndex;
};
