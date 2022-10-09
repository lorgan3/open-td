import { TileType } from "../../data/terrain/tile";

export enum AtlasTile {
  Grass = "32x32_tiles-47.png",
  Sand = "32x32_tiles-122.png",
  Water = "32x32_tiles-485.png",
  WaterAlt = "32x32_tiles-495.png",
  Tree = "32x32_tiles-162.png",
  Rock = "32x32_tiles-321.png",
  Ice = "32x32_tiles-487.png",
  Snow = "32x32_tiles-73.png",
  Dirt = "32x32_tiles-54.png",
}

export const TILE_TO_ATLAS_MAP: Partial<Record<TileType, AtlasTile>> = {
  [TileType.Grass]: AtlasTile.Grass,
  [TileType.Sand]: AtlasTile.Sand,
  [TileType.Water]: AtlasTile.Water,
  [TileType.Ice]: AtlasTile.Ice,
  [TileType.Snow]: AtlasTile.Snow,
  [TileType.Dirt]: AtlasTile.Dirt,
  [TileType.Tree]: AtlasTile.Tree,
  [TileType.Rock]: AtlasTile.Rock,
};
