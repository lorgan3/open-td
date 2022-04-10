import Tile from "../terrain/tile";

let id = 1;

export interface Agent {
  entity: Entity;
  getType(): EntityType;
  tick?: (dt: number) => void;
}

export enum EntityType {
  Tower = 1,
  Slime = 2,
  Base = 3,
  Bullet = 4,
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

  getY() {
    return this.y;
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

    const xDiff = to.getX() - x;
    const yDiff = to.getY() - y;

    if (xDiff || yDiff) {
      this.setRotation((-Math.atan(xDiff / yDiff) * 180) / Math.PI + 180);
    }
  }
}

export default Entity;
