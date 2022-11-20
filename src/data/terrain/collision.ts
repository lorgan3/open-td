import { TileType } from "./constants";
import Tile from "./tile";

export const SOLID_TILES = new Set<TileType>([
  TileType.Obstructed,
  TileType.Wall,
  TileType.PlayerBuilding,
  TileType.Base,
]);

export const isSolid = (tile: Tile) => SOLID_TILES.has(tile.getType());
