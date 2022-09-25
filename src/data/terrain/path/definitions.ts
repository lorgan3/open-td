import { TileType } from "../tile";

export const DEFAULT_LAND_BASED_COSTS: Partial<Record<TileType, number>> = {
  [TileType.Grass]: 3,
  [TileType.Water]: 20,
  [TileType.Stone]: 4,
  [TileType.Wall]: 3,
  [TileType.Spore]: 2,
  [TileType.ElectricFence]: 5,
  [TileType.Fence]: 20,
  [TileType.Freezer]: 6,
  [TileType.Obstructed]: 3,
  [TileType.Bridge]: 5,
  [TileType.Dirt]: 2.5,
  [TileType.Sand]: 3.5,
  [TileType.Snow]: 3.5,
  [TileType.Ice]: 10,
  [TileType.PlayerBuilding]: 3,
  [TileType.NaturalFeature]: 5,
  [TileType.Base]: Number.EPSILON,
};

export const DEFAULT_LAND_BASED_MULTIPLIERS: Partial<Record<TileType, number>> =
  {
    [TileType.Fence]: 5,
    [TileType.ElectricFence]: 40,
    [TileType.Wall]: 66.666,
    [TileType.Freezer]: 0.5,
    [TileType.Obstructed]: 500,
    [TileType.PlayerBuilding]: -10,
  };

export const DEFAULT_SKY_BASED_COSTS: Partial<Record<TileType, number>> = {
  [TileType.Grass]: 3,
  [TileType.Water]: 3,
  [TileType.Stone]: 3,
  [TileType.Wall]: 3,
  [TileType.Spore]: 3,
  [TileType.ElectricFence]: 3,
  [TileType.Fence]: 3,
  [TileType.Freezer]: 6,
  [TileType.Obstructed]: 3,
  [TileType.Bridge]: 3,
  [TileType.Dirt]: 3,
  [TileType.Sand]: 3,
  [TileType.Snow]: 3,
  [TileType.Ice]: 3,
  [TileType.PlayerBuilding]: 3,
  [TileType.NaturalFeature]: 3,
  [TileType.Base]: Number.EPSILON,
};

export const DEFAULT_SKY_BASED_MULTIPLIERS: Partial<Record<TileType, number>> =
  {
    [TileType.Fence]: 4,
    [TileType.ElectricFence]: 4,
    [TileType.Wall]: 4,
    [TileType.NaturalFeature]: 4,
    [TileType.Freezer]: 0.5,
    [TileType.Obstructed]: 10,
    [TileType.PlayerBuilding]: -10,
  };
