import Manager from "../../manager";
import Tile from "../../terrain/tile";
import { IEnemy } from "../enemies";
import Entity, { Agent, AgentCategory, EntityType } from "../entity";

const SPEED = 0.002;

class Shockwave implements Agent {
  public entity: Entity;
  public category = AgentCategory.Unknown;
  public renderData = {};

  private time = 0;
  private travelTime: number;

  constructor(
    private tile: Tile,
    private target: Tile,
    private damage: number
  ) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);

    const xDiff = tile.getX() - target.getX();
    const yDiff = tile.getY() - target.getY();
    const dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    this.travelTime = dist / SPEED;
    this.time = this.travelTime / 4; // start at .25 of the way there to prevent multiple shockwaves being clumped up

    this.entity.lookAt(target);
  }

  tick(dt: number) {
    if (this.time >= this.travelTime) {
      Manager.Instance.getSurface().despawn(this);

      [
        ...Manager.Instance.getSurface().getEntitiesForCategory(
          AgentCategory.Enemy
        ),
      ]
        .filter(
          (enemy) =>
            enemy.getAlignedX() === this.target.getX() &&
            enemy.getAlignedY() === this.target.getY()
        )
        .forEach((enemy) => {
          (enemy.getAgent() as IEnemy).AI.hit(this.damage);
        });
    }

    this.time = Math.min(this.time + dt, this.travelTime);
    const t = this.time / this.travelTime;
    this.entity.setX(
      (this.target.getX() - this.tile.getX()) * t + this.tile.getX()
    );
    this.entity.setY(
      (this.target.getY() - this.tile.getY()) * t + this.tile.getY()
    );
  }

  getType(): EntityType {
    return EntityType.Shockwave;
  }

  getTile() {
    return this.tile;
  }

  isVisible() {
    return true;
  }
}

export default Shockwave;
