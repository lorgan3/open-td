import Manager from "../../manager";
import Tile from "../../terrain/tile";
import { IEnemy } from "../enemies";
import Entity, { Agent, AgentCategory, EntityType } from "../entity";

const SPEED = 0.015;

class Bullet implements Agent {
  public entity: Entity;
  public category = AgentCategory.Unknown;
  public renderData = {};

  private targetX: number;
  private targetY: number;

  private time = 0;
  private travelTime: number;

  constructor(
    private tile: Tile,
    private target: IEnemy,
    private damage: number
  ) {
    this.entity = new Entity(tile.getX() + 0.5, tile.getY() + 0.5, this);

    // This requires the projectile to travel fast enough as this does not consider that the travel time changes as the target moves.
    const xDiff = tile.getX() + 0.5 - target.entity.getX() - 0.25;
    const yDiff = tile.getY() + 0.5 - target.entity.getY() - 0.25;
    const dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    this.travelTime = dist / SPEED;

    const index = this.target.AI.getFuturePosition(this.travelTime);

    const { x, y } = target.getPath().getCoordinates(index);
    this.targetX = x;
    this.targetY = y;
    this.entity.lookAt(x, y);
  }

  tick(dt: number) {
    if (this.time >= this.travelTime) {
      Manager.Instance.getSurface().despawn(this);
      this.target.AI.hit(this.damage);
    }

    this.time = Math.min(this.time + dt, this.travelTime);
    const t = this.time / this.travelTime;

    const x = this.tile.getX() + 1;
    const y = this.tile.getY() + 1;

    this.entity.setX((this.targetX + 0.5 - x) * t + x);
    this.entity.setY((this.targetY + 0.5 - y) * t + y);
  }

  getType(): EntityType {
    return EntityType.Bullet;
  }

  getTile() {
    return this.tile;
  }

  isVisible() {
    return true;
  }
}

export default Bullet;
