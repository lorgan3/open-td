import { Projectile } from ".";
import Manager from "../../controllers/manager";
import { lerp } from "../../util/math";
import { IEnemy } from "../enemies";
import Entity, { Agent } from "../entity";
import { AgentCategory, EntityType } from "../constants";

import { getCenter } from "../staticEntity";
import { getSquareDistance } from "../../util/distance";
import { ITower } from "../towers";

const SPEED = 0.01;
export const LIFETIME = 800;

class Spark extends Projectile implements Agent {
  public entity: Entity;
  public category = AgentCategory.Unknown;
  public renderData = {};

  public time = 0;
  private sectionTime = 0;
  private index = -1;

  constructor(
    protected source: ITower,
    protected chain: IEnemy[],
    damage: number
  ) {
    super();
    const [cx, cy] = getCenter(source);
    this.sourceX = cx;
    this.sourceY = cy;

    chain.forEach((enemy) => {
      enemy.AI.hit(damage);
      enemy.stun && enemy.stun();
    });

    this.entity = new Entity(this.sourceX, this.sourceY, this);
    this.nextTarget();
  }

  private nextTarget() {
    this.index++;
    if (this.index >= this.chain.length) {
      this.entity.setX(this.sourceX);
      this.entity.setY(this.sourceY);
      this.index = 0;
    }

    const target = this.chain[this.index];
    this.targetX = target.getOffsetX();
    this.targetY = target.getOffsetY();

    this.travelTime =
      Math.sqrt(
        getSquareDistance(
          this.entity.getX(),
          this.entity.getY(),
          this.targetX,
          this.targetY
        )
      ) / SPEED;
    this.sectionTime = 0;

    this.entity.lookAt(this.targetX, this.targetY);
  }

  tick(dt: number) {
    if (this.time >= LIFETIME) {
      Manager.Instance.getSurface().despawn(this);
    }
    this.time += dt;
    this.sectionTime += dt;

    if (this.sectionTime > this.travelTime) {
      this.nextTarget();
    }

    const t = this.sectionTime / this.travelTime;
    this.entity.setX(lerp(this.sourceX, this.targetX, t));
    this.entity.setY(lerp(this.sourceY, this.targetY, t));
  }

  getChain() {
    return this.chain;
  }

  getType(): EntityType {
    return EntityType.Spark;
  }

  isVisible() {
    return true;
  }
}

export default Spark;
