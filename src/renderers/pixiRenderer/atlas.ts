import { TileType } from "../../data/terrain/tile";

export const ATLAS = "atlas";

export enum AtlasTile {
  Grass = "atlas3.png",
  Sand = "atlas6.png",
  Water = "atlas9.png",
  WaterAlt = "atlas10.png",
  Tree = "atlas7.png",
  Rock = "atlas8.png",
  Ice = "atlas1.png",
  Snow = "atlas2.png",
  Dirt = "atlas0.png",
  Stone = "atlas11.png",
  Spore = "atlas12.png",
  Up = "atlas13.png",
  Left = "atlas14.png",
  Down = "atlas15.png",
  Right = "atlas16.png",
  UpRight = "atlas17.png",
  UpLeft = "atlas18.png",
  DownLeft = "atlas19.png",
  DownRight = "atlas20.png",
  Multi = "atlas21.png",
  ActiveCoverage = "atlas22.png",
  Coverage = "atlas23.png",
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
  [TileType.Stone]: AtlasTile.Stone,
  [TileType.Spore]: AtlasTile.Spore,
};
