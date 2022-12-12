export enum AgentCategory {
  Unknown = 0,
  Player = 1,
  Enemy = 2,
}

export enum EntityType {
  None = 0,
  Tower = 1,
  Slime = 2,
  Base = 3,
  Bullet = 4,
  Wall = 5,
  Mortar = 6,
  Flamethrower = 7,
  Flame = 8,
  Railgun = 9,
  Rail = 10,
  ElectricFence = 11,
  Fence = 12,
  Freezer = 13,
  Tree = 14,
  Rock = 15,
  Radar = 16,
  PowerPlant = 17,
  Blueprint = 18,
  Shockwave = 19,
  Armory = 20,
  Market = 21,
  SpeedBeacon = 22,
  Runner = 23,
  DamageBeacon = 24,
  Laser = 25,
  LaserBeam = 26,
  Flier = 27,
  Tank = 28,
  Rocket = 29,
  WavePoint = 30,

  // These are not entities.
  // @TODO use a different reference so this is not necessary?
  Excavator = 31,
  Convert = 32,
  Terraform = 33,
  EmergencyRecharge = 34,
  EmergencyRepair = 35,
}

export const BASE_ENTITIES = new Set([
  EntityType.Base,
  EntityType.Radar,
  EntityType.PowerPlant,
  EntityType.Armory,
  EntityType.Market,
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
]);
