import Manager from "../manager";
import Tile from "../terrain/tile";
import { IEnemy } from "./enemies";
import Entity, { Agent, AgentCategory, EntityType } from "./entity";

const SPEED = 0.015;

class Bullet implements Agent {
  public entity: Entity;
  public category = AgentCategory.Unknown;

  private targetX: number;
  private targetY: number;

  private time = 0;
  private travelTime: number;

  constructor(
    private tile: Tile,
    private target: IEnemy,
    private damage: number
  ) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);

    // This requires the projectile to travel fast enough as this does not consider that the travel time changes as the target moves.
    const xDiff = tile.getX() - target.entity.getX();
    const yDiff = tile.getY() - target.entity.getY();
    const dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    this.travelTime = dist / SPEED;

    const index = this.target.getPath().getFuturePosition(this.travelTime);

    const { x, y } = target.getPath().getCoordinates(index);
    this.targetX = x;
    this.targetY = y;
  }

  tick(dt: number) {
    if (this.time >= this.travelTime) {
      Manager.Instance.getSurface().despawn(this);
      this.target.hit(this.damage);
    }

    this.time = Math.min(this.time + dt, this.travelTime);
    const t = this.time / this.travelTime;
    this.entity.setX((this.targetX - this.tile.getX()) * t + this.tile.getX());
    this.entity.setY((this.targetY - this.tile.getY()) * t + this.tile.getY());
  }

  getType(): EntityType {
    return EntityType.Bullet;
  }

  getTile() {
    return this.tile;
  }
}

export default Bullet;
