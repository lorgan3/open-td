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
  Pine,
  Cactus,
  Stump,
  Rock,
  Rock2,
  Rock3,
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
  Behemoth,
  Bore,

  // These are not entities.
  // @TODO use a different reference so this is not necessary?
  Excavator,
  Convert,
  Terraform,
  EmergencyRecharge,
  EmergencyRepair,
}

export enum TreeType {
  Simple,
  Pine,
  Cactus,
}

export enum RockType {
  Rock1,
  Rock2 = 1,
  Rock3 = 1,
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
  EntityType.Pine,
  EntityType.Cactus,
  EntityType.Rock,
  EntityType.Rock2,
  EntityType.Rock3,
  EntityType.SpeedBeacon,
  EntityType.DamageBeacon,
  EntityType.Laser,
  EntityType.Wall,
  EntityType.Tesla,
]);
