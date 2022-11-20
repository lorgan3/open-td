import Tile from "../terrain/tile";
import { AgentCategory, EntityType } from "./constants";

let id = 1;

export type RenderData = Record<string, any>;
export interface Agent {
  entity: Entity;
  getType(): EntityType;
  tick?: (dt: number) => void;
  category: AgentCategory;
  spawn?: () => void;
  despawn?: () => void;
  hit?: (damage: number) => void;
  isVisible: () => boolean;
  renderData: RenderData;
}

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

  lookAt(x: number, y: number): void;
  lookAt(target: Tile | Entity): void;
  lookAt(target: Tile | Entity | number, y?: number) {
    let xDiff: number, yDiff: number;
    if (y !== undefined) {
      xDiff = (target as number) - this.x;
      yDiff = y - this.y;
    } else {
      xDiff = (target as Tile | Entity).getX() - this.x;
      yDiff = (target as Tile | Entity).getY() - this.y;
    }

    if (xDiff || yDiff) {
      this.setRotation((Math.atan2(yDiff, xDiff) * 180) / Math.PI + 90);
    }
  }
}

export default Entity;
