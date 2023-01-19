import { aim, Projectile } from ".";
import Manager from "../../controllers/manager";
import { lerp } from "../../util/math";
import { IEnemy } from "../enemies";
import Entity, { Agent } from "../entity";
import { AgentCategory, EntityType } from "../constants";

import { ITower } from "../towers";

const SPEED = 0.015;

class Bullet extends Projectile implements Agent {
  public entity: Entity;
  public category = AgentCategory.Unknown;
  public renderData = {};

  private time = 0;

  constructor(
    protected source: ITower,
    protected target: IEnemy,
    private damage: number
  ) {
    super();
    aim.call(this, SPEED);

    this.entity = new Entity(this.sourceX, this.sourceY, this);
    this.entity.lookAt(this.targetX, this.targetY);
    this.source.entity.setRotation(this.entity.getRotation());
  }

  tick(dt: number) {
    if (this.time >= this.travelTime) {
      Manager.Instance.getSurface().despawn(this);
      this.target.AI.hit(this.damage);
    }

    this.time = Math.min(this.time + dt, this.travelTime);
    const t = this.time / this.travelTime;

    this.entity.setX(lerp(this.sourceX, this.targetX, t));
    this.entity.setY(lerp(this.sourceY, this.targetY, t));
  }

  getType(): EntityType {
    return EntityType.Bullet;
  }

  isVisible() {
    return true;
  }
}

export default Bullet;
