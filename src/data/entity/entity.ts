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
}

export type AgentClass = new (tile: Tile) => Agent;

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
}

class Entity {
  private id: number;
  private rotation = 0;

  constructor(private x: number, private y: number, private agent: Agent) {
    this.id = id++;
  }

  getX() {
    return this.x;
  }

  getAlignedX() {
    return Math.floor(this.x);
  }

  getY() {
    return this.y;
  }

  getAlignedY() {
    return Math.floor(this.y);
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
