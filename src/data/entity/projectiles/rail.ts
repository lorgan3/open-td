import Manager from "../../controllers/manager";
import { isSolid } from "../../terrain/collision";
import { getRayDistance, getSquareDistance } from "../../util/distance";
import { IEnemy } from "../enemies";
import Entity, { Agent } from "../entity";
import { AgentCategory, EntityType } from "../constants";
import { getCenter } from "../staticEntity";
import { ITower } from "../towers";
import Railgun from "../towers/railgun";
import EventSystem from "../../eventSystem";
import { GameEvent } from "../../events";

export const LIFETIME = 1500;

class Rail implements Agent {
  public entity: Entity;
  public category = AgentCategory.Unknown;
  public renderData = {};

  public targetX!: number;
  public targetY!: number;

  public time = 0;

  constructor(private source: ITower, target: IEnemy, private damage: number) {
    const [x, y] = getCenter(source);
    this.entity = new Entity(x, y, this);
    const direction = Math.atan2(
      target.getOffsetY() + 0.5 - this.entity.getY(),
      target.getOffsetX() + 0.5 - this.entity.getX()
    );
    this.entity.setRotation((direction * 180) / Math.PI);
    this.source.entity.setRotation(this.entity.getRotation() + 90);

    Manager.Instance.getSurface().forRay(
      target.entity.getX(),
      target.entity.getY(),
      direction,
      (tile) => {
        this.targetX = tile.getX();
        this.targetY = tile.getY();

        if (isSolid(tile)) {
          return false;
        }

        return true;
      }
    );

    const squaredDistance = getSquareDistance(
      this.entity.getX(),
      this.entity.getY(),
      this.targetX,
      this.targetY
    );

    const targets = [
      ...Manager.Instance.getSurface().getEntitiesForCategory(
        AgentCategory.Enemy
      ),
    ]
      .filter(
        (enemy) =>
          getSquareDistance(
            this.entity.getX(),
            this.entity.getY(),
            enemy.getX() + 0.5,
            enemy.getY() + 0.5
          ) <=
          squaredDistance + 1
      )
      .filter((enemy) => {
        const dist = getRayDistance(
          this.entity.getX(),
          this.entity.getY(),
          direction,
          enemy.getX() + 0.5,
          enemy.getY() + 0.5
        );

        return dist <= (enemy.getAgent() as IEnemy).getScale() / 2;
      });

    targets.forEach((enemy) => {
      (enemy.getAgent() as IEnemy).AI.hit(this.damage);
    });

    if (targets.length > Railgun.maxPierceEnemies) {
      Railgun.maxPierceEnemies = targets.length;
      EventSystem.Instance.triggerEvent(GameEvent.Pierce, {
        amount: targets.length,
      });
    }
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

  isVisible() {
    return true;
  }
}

export default Rail;
