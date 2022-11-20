import Manager from "../../controllers/manager";
import { IEnemy } from "../enemies";
import Entity, { Agent, AgentCategory, EntityType } from "../entity";
import { getCenter } from "../staticEntity";
import { ITower } from "../towers";

export const LIFETIME = 250;

class LaserBeam implements Agent {
  public entity: Entity;
  public category = AgentCategory.Unknown;
  public renderData = {};

  public time = 0;
  public targetX = 0;
  public targetY = 0;

  constructor(private source: ITower) {
    const [x, y] = getCenter(source);
    this.entity = new Entity(x, y, this);
  }

  dealDamage(enemy: IEnemy, damage: number) {
    if (this.time > LIFETIME) {
      Manager.Instance.getSurface().spawn(this);
    }

    this.time = 0;

    this.targetX = enemy.entity.getX() + 0.5;
    this.targetY = enemy.entity.getY() + 0.5;
    const direction = Math.atan2(
      this.targetY - this.entity.getY(),
      this.targetX - this.entity.getX()
    );
    this.entity.setRotation((direction * 180) / Math.PI);
    this.source.entity.setRotation(this.entity.getRotation() + 90);

    enemy.AI.hit(damage);
    enemy.lightOnFire && enemy.lightOnFire();
  }

  tick(dt: number) {
    this.time += dt;
    if (this.time > LIFETIME) {
      Manager.Instance.getSurface().despawn(this);
    }
  }

  getType(): EntityType {
    return EntityType.LaserBeam;
  }

  isVisible() {
    return true;
  }
}

export default LaserBeam;
