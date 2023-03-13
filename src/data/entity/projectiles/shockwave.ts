import { hitTest } from ".";
import Manager from "../../controllers/manager";
import Tile from "../../terrain/tile";
import { lerp } from "../../util/math";
import { AgentCategory, EntityType } from "../constants";
import { IEnemy } from "../enemies";
import Entity, { Agent } from "../entity";

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
    this.entity = new Entity(tile.getX() + 0.5, tile.getY() + 0.5, this);

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
        .filter((enemy) => hitTest.call(this, enemy.getAgent() as IEnemy, 1))
        .forEach((enemy) => {
          (enemy.getAgent() as IEnemy).AI.hit(this.damage);
        });
    }

    this.time = Math.min(this.time + dt, this.travelTime);
    const t = this.time / this.travelTime;

    this.entity.setX(lerp(this.tile.getX(), this.target.getX(), t) + 0.5);
    this.entity.setY(lerp(this.tile.getY(), this.target.getY(), t) + 0.5);
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
