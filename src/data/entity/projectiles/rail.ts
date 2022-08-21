import Manager from "../../manager";
import { isSolid } from "../../terrain/collision";
import Tile from "../../terrain/tile";
import { getRayDistance } from "../../util/distance";
import { IEnemy } from "../enemies";
import Entity, { Agent, AgentCategory, EntityType } from "../entity";

export const LIFETIME = 1500;

class Rail implements Agent {
  public entity: Entity;
  public category = AgentCategory.Unknown;

  public targetX: number;
  public targetY: number;

  public time = 0;
  private steps: Tile[] = [];

  constructor(private tile: Tile, target: IEnemy, private damage: number) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
    const direction = Math.atan2(
      target.entity.getY() - tile.getY(),
      target.entity.getX() - tile.getX()
    );
    this.entity.setRotation((direction * 180) / Math.PI);

    Manager.Instance.getSurface().forRay(
      tile.getX(),
      tile.getY(),
      direction,
      (tile, i) => {
        if (i > 0 && isSolid(tile)) {
          return false;
        }

        this.steps.push(tile);
        return true;
      }
    );

    this.targetX = this.steps[this.steps.length - 1].getX();
    this.targetY = this.steps[this.steps.length - 1].getY();

    [
      ...Manager.Instance.getSurface().getEntitiesForCategory(
        AgentCategory.Enemy
      ),
    ]
      .filter((enemy) => {
        const dist = getRayDistance(
          tile.getX(),
          tile.getY(),
          direction,
          enemy.getX(),
          enemy.getY()
        );

        return dist <= 0.5;
      })
      .forEach((enemy) => (enemy.getAgent() as IEnemy).hit(this.damage));
  }

  tick(dt: number) {
    this.time += dt;
    if (this.time > LIFETIME) {
      Manager.Instance.getSurface().despawn(this);
    }
  }

  getType(): EntityType {
    return EntityType.Rail;
  }

  getTile() {
    return this.tile;
  }

  isVisible() {
    return true;
  }
}

export default Rail;
