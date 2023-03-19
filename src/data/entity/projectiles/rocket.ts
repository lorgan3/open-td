import { aim, hitTest, Projectile } from ".";
import Manager from "../../controllers/manager";
import { lerp } from "../../util/math";
import { IEnemy } from "../enemies";
import Entity, { Agent } from "../entity";
import { AgentCategory, EntityType } from "../constants";
import { ITower } from "../towers";
import Mortar from "../towers/mortar";
import EventSystem from "../../eventSystem";
import { GameEvent } from "../../events";

const SPEED = 0.01;
const ARC_HEIGHT = 5;
const RANGE = 2;
const RANGE_SQUARED = RANGE * RANGE;

class Rocket extends Projectile implements Agent {
  public entity: Entity;
  public category = AgentCategory.Unknown;
  public renderData = {};

  private time = 0;

  private prevX?: number;
  private prevY?: number;
  public straightY = 0;

  constructor(
    protected source: ITower,
    protected target: IEnemy,
    private damage: number
  ) {
    super();
    aim.call(this, SPEED, ARC_HEIGHT * 2);

    this.entity = new Entity(this.sourceX, this.sourceY, this);
    this.entity.lookAt(this.targetX, this.targetY);
    this.source.entity.setRotation(this.entity.getRotation());

    this.entity = new Entity(this.sourceX, this.sourceY, this);
    this.entity.lookAt(this.targetX, this.targetY);
    this.source.entity.setRotation(this.entity.getRotation());
  }

  tick(dt: number) {
    if (this.time >= this.travelTime) {
      Manager.Instance.getSurface().despawn(this);

      let hitTarget = false;
      const targets = [
        ...Manager.Instance.getSurface().getEntitiesForCategory(
          AgentCategory.Enemy
        ),
      ].filter((enemy) =>
        hitTest.call(this, enemy.getAgent() as IEnemy, RANGE_SQUARED)
      );

      targets.forEach((enemy) => {
        (enemy.getAgent() as IEnemy).AI.hit(this.damage);
        if (enemy.getAgent() === this.target) {
          hitTarget = true;
        }
      });

      if (targets.length > Mortar.maxBombedEnemies) {
        Mortar.maxBombedEnemies = targets.length;
        EventSystem.Instance.triggerEvent(GameEvent.Bomb, {
          amount: targets.length,
        });
      }

      if (!hitTarget) {
        this.target.AI.miss(this.damage);
      }
    }

    this.time = Math.min(this.time + dt, this.travelTime);
    const t = this.time / this.travelTime;

    const arc = Math.sin(t * Math.PI) * ARC_HEIGHT;
    this.straightY = lerp(this.sourceY, this.targetY, t);
    this.entity.setX(lerp(this.sourceX, this.targetX, t));
    this.entity.setY(this.straightY - arc);

    if (this.prevX && this.prevY) {
      const xDiff = this.entity.getX() - this.prevX;
      const yDiff = this.entity.getY() - this.prevY;

      this.entity.setRotation((Math.atan2(yDiff, xDiff) * 180) / Math.PI + 90);
    }

    this.prevX = this.entity.getX();
    this.prevY = this.entity.getY();
  }

  getType(): EntityType {
    return EntityType.Rocket;
  }

  isVisible() {
    return true;
  }

  getPercentage() {
    return this.time / this.travelTime;
  }
}

export default Rocket;
