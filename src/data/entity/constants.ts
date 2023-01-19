export enum AgentCategory {
  Unknown = 0,
  Player = 1,
  Enemy = 2,
}

export enum EntityType {
  None,
  Tower,
  Slime,
  Base,
  Bullet,
  Wall,
  Mortar,
  Flamethrower,
  Flame,
  Railgun,
  Rail,
  ElectricFence,
  Fence,
  Freezer,
  Tree,
  Rock,
  Radar,
  PowerPlant,
  Blueprint,
  Shockwave,
  Armory,
  Market,
  SpeedBeacon,
  Runner,
  DamageBeacon,
  Laser,
  LaserBeam,
  Flier,
  Tank,
  Rocket,
  WavePoint,
  Barracks,
  Tesla,
  Spark,

  // These are not entities.
  // @TODO use a different reference so this is not necessary?
  Excavator,
  Convert,
  Terraform,
  EmergencyRecharge,
  EmergencyRepair,
}

export const BASE_ENTITIES = new Set([
  EntityType.Base,
  EntityType.Radar,
  EntityType.PowerPlant,
  EntityType.Armory,
  EntityType.Market,
  EntityType.Barracks,
]);

export const DESTRUCTIBLE_ENTITIES = new Set([
  ...BASE_ENTITIES,
  EntityType.Tower,
  EntityType.Mortar,
  EntityType.Flamethrower,
  EntityType.Railgun,
  EntityType.Tree,
  EntityType.Rock,
  EntityType.SpeedBeacon,
  EntityType.DamageBeacon,
  EntityType.Laser,
  EntityType.Wall,
  EntityType.Tesla,
]);
