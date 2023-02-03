import { TileType } from "../../../data/terrain/constants";
import { ATLAS } from "../atlas";

export const wallCoordinates = {
  1: [
    [0, -1],
    [-1, 0],
    [0, 1],
    [1, 0],
    [1, -1],
    [-1, -1],
    [-1, 1],
    [1, 1],
  ],
  2: [
    [0, -1],
    [-1, 0],
    [0, 2],
    [2, 0],
    [2, -1],
    [-1, -1],
    [-1, 2],
    [2, 2],
  ],
};

export const wallSpritePadding = 8;

export const wallTypes = new Set([
  TileType.Fence,
  TileType.Wall,
  TileType.ElectricFence,
]);

export const spriteAssets = {
  fences: `${import.meta.env.BASE_URL}tiles/fenceCombined.json`,
  wall: `${import.meta.env.BASE_URL}tiles/bigWall.json`,
  [ATLAS]: `${import.meta.env.BASE_URL}tiles/atlas.json`,
};
