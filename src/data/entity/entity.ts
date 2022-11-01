import Tile from "../terrain/tile";

let id = 1;

export enum AgentCategory {
  Unknown = 0,
  Player = 1,
  Enemy = 2,
}

export interface Agent {
  entity: Entity;
  getType(): EntityType;
  tick?: (dt: number) => void;
  category: AgentCategory;
  spawn?: () => void;
  despawn?: () => void;
  hit?: (damage: number) => void;
  isVisible: () => boolean;
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

  // These are not entities.
  // @TODO use a different reference so this is not necessary?
  Excavator = 29,
  Convert = 30,
  Terraform = 31,
  EmergencyRecharge = 32,
  EmergencyRepair = 33,
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

class Entity {
  private id: number;
  private rotation = 0;

  constructor(private x: number, private y: number, protected agent: Agent) {
    this.id = id++;
  }

  getX() {
    return this.x;
  }

  getAlignedX() {
    return this.x | 0;
  }

  getY() {
    return this.y;
  }

  getAlignedY() {
    return this.y | 0;
  }

  getAgent() {
    return this.agent;
  }

  getId() {
    return this.id;
  }

  setX(x: number) {
    this.x = x;
  }

  setY(y: number) {
    this.y = y;
  }

  getRotation() {
    return this.rotation;
  }

  setRotation(rotation: number) {
    this.rotation = rotation;
  }

  /**
   * @param t Number between [0, 1] that dictates where between `from` and `to` the entity is.
   */
  move(from: Tile, to: Tile, t: number) {
    const x = (to.getX() - from.getX()) * t + from.getX();
    const y = (to.getY() - from.getY()) * t + from.getY();

    this.setX(x);
    this.setY(y);
    this.lookAt(to);
  }

  lookAt(target: Tile) {
    const xDiff = target.getX() - this.x;
    const yDiff = target.getY() - this.y;

    if (xDiff || yDiff) {
      this.setRotation((Math.atan2(yDiff, xDiff) * 180) / Math.PI + 90);
    }
  }
}

export default Entity;
