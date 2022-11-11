import Manager from "../../manager";
import { isSolid } from "../../terrain/collision";
import Tile from "../../terrain/tile";
import { getRayDistance, getSquareDistance } from "../../util/distance";
import { IEnemy } from "../enemies";
import Entity, { Agent, AgentCategory, EntityType } from "../entity";

export const LIFETIME = 1500;

class Rail implements Agent {
  public entity: Entity;
  public category = AgentCategory.Unknown;
  public renderData = {};

  public targetX: number;
  public targetY: number;

  public time = 0;

  constructor(private tile: Tile, target: IEnemy, private damage: number) {
    this.entity = new Entity(tile.getX() + 0.5, tile.getY() + 0.5, this);
    const direction = Math.atan2(
      target.entity.getY() + 0.25 - tile.getY() - 0.5,
      target.entity.getX() + 0.25 - tile.getX() - 0.5
    );
    this.entity.setRotation((direction * 180) / Math.PI);

    this.targetX = target.entity.getX();
    this.targetY = target.entity.getY();
    Manager.Instance.getSurface().forRay(
      target.entity.getX(),
      target.entity.getY(),
      direction,
      (tile, i) => {
        if (isSolid(tile)) {
          return false;
        }

        this.targetX = tile.getX();
        this.targetY = tile.getY();
        return true;
      }
    );

    let hits = 0;
    const squaredDistance = getSquareDistance(
      tile.getX() + 1,
      tile.getY() + 1,
      this.targetX,
      this.targetY
    );

    [
      ...Manager.Instance.getSurface().getEntitiesForCategory(
        AgentCategory.Enemy
      ),
    ]
      .filter(
        (enemy) =>
          getSquareDistance(
            tile.getX() + 1,
            tile.getY() + 1,
            enemy.getX(),
            enemy.getY()
          ) <=
          squaredDistance + 1
      )
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
      .forEach((enemy) => {
        (enemy.getAgent() as IEnemy).AI.hit(this.damage);
        hits++;
      });
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
