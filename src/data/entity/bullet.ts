import Manager from "../manager";
import { DEFAULT_COSTS } from "../terrain/pathfinder";
import Tile from "../terrain/tile";
import { IEnemy } from "./enemy";
import Entity, { Agent, EntityType } from "./entity";

const SPEED = 0.015;

class Bullet implements Agent {
  public entity: Entity;
  private destination: Tile;

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

    // @TODO: rounding the destination to 1 tile looks bad
    this.destination = target.getPath().getTile(index);
  }

  tick(dt: number) {
    if (this.time >= this.travelTime) {
      Manager.Instance.getSurface().despawn(this);
      this.target.hit(this.damage);
    }

    this.time += dt;
    this.entity.move(this.tile, this.destination, this.time / this.travelTime);
  }

  getType(): EntityType {
    return EntityType.Bullet;
  }

  getTile() {
    return this.tile;
  }
}

export default Bullet;
