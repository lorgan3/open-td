import Tile, { TileType } from "./tile";

export const SOLID_TILES = new Set<TileType>([
  TileType.Obstructed,
  TileType.Wall,
]);

export const isSolid = (tile: Tile) => SOLID_TILES.has(tile.getType());
