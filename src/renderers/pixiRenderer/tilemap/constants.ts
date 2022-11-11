import { TileType } from "../../../data/terrain/tile";

export const wallCoordinates = [
  [0, -1],
  [-1, 0],
  [0, 1],
  [1, 0],
  [1, -1],
  [-1, -1],
  [-1, 1],
  [1, 1],
];

export const wallTypes = new Set([
  TileType.Fence,
  TileType.Wall,
  TileType.ElectricFence,
]);
