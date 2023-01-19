import { EntityType } from "../entity/constants";

export enum DiscoveryStatus {
  Undiscovered,
  Pending,
  Discovered,
}

export enum TileType {
  Void = 0,
  Grass = 1,
  Stone = 2,
  Water = 3,
  Obstructed = 4,
  Wall = 5,
  Spore = 6,
  ElectricFence = 7,
  Fence = 8,
  Freezer = 9,
  Bridge = 10,
  Dirt = 11,
  Snow = 12,
  Sand = 13,
  Ice = 14,
  PlayerBuilding = 15,
  Tree = 16,
  Rock = 17,
  Base = 18,
}

export const FREE_TILES = new Set([
  TileType.Grass,
  TileType.Stone,
  TileType.Dirt,
  TileType.Sand,
  TileType.Snow,
]);

export const FREE_TILES_INCLUDING_WATER = new Set([
  ...FREE_TILES,
  TileType.Water,
  TileType.Ice,
  TileType.Bridge,
  TileType.Tree,
  TileType.Rock,
]);

export const FREE_TILES_INCLUDING_BUILDINGS = new Set([
  ...FREE_TILES_INCLUDING_WATER,
  TileType.Freezer,
  TileType.ElectricFence,
  TileType.Fence,
]);

export const STATIC_ENTITY_GROUND_TILE_MAP: Partial<
  Record<EntityType, TileType>
> = {
  [EntityType.Tower]: TileType.Obstructed,
  [EntityType.Wall]: TileType.Wall,
  [EntityType.Mortar]: TileType.Obstructed,
  [EntityType.Flamethrower]: TileType.Obstructed,
  [EntityType.Railgun]: TileType.Obstructed,
  [EntityType.ElectricFence]: TileType.ElectricFence,
  [EntityType.Fence]: TileType.Fence,
  [EntityType.Freezer]: TileType.Freezer,
  [EntityType.Radar]: TileType.Base,
  [EntityType.PowerPlant]: TileType.Base,
  [EntityType.Tree]: TileType.Tree,
  [EntityType.Rock]: TileType.Rock,
  [EntityType.Armory]: TileType.Base,
  [EntityType.Base]: TileType.Base,
  [EntityType.Market]: TileType.Base,
  [EntityType.SpeedBeacon]: TileType.Obstructed,
  [EntityType.DamageBeacon]: TileType.Obstructed,
  [EntityType.Laser]: TileType.Obstructed,
  [EntityType.Barracks]: TileType.Base,
  [EntityType.Tesla]: TileType.Obstructed,
};
