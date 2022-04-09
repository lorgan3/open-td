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
