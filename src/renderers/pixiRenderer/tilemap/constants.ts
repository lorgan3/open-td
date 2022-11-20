import { TileType } from "../../../data/terrain/constants";

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
