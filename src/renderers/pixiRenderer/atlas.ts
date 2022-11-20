import { TileType } from "../../data/terrain/constants";

export const ATLAS = "atlas";

export enum AtlasTile {
  Grass = "atlas4.png",
  Sand = "atlas7.png",
  Water = "atlas10.png",
  WaterAlt = "atlas11.png",
  Tree = "atlas8.png",
  Rock = "atlas9.png",
  Ice = "atlas2.png",
  Snow = "atlas3.png",
  Dirt = "atlas1.png",
  Stone = "atlas12.png",
  Spore = "atlas13.png",
  Up = "atlas14.png",
  Left = "atlas15.png",
  Down = "atlas16.png",
  Right = "atlas17.png",
  UpRight = "atlas18.png",
  UpLeft = "atlas19.png",
  DownLeft = "atlas20.png",
  DownRight = "atlas21.png",
  Multi = "atlas22.png",
  ActiveCoverage = "atlas23.png",
  Coverage = "atlas24.png",
  Alert = "atlas25.png",
  Fence = "atlas26.png",
  ElectricFence = "atlas27.png",
  Entity = "atlas28.png",
  Unknown = "atlas29.png",
  Bridge = "atlas5.png",
  None = "atlas0.png",
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
  [TileType.Bridge]: AtlasTile.Bridge,
};
