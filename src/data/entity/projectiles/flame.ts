import Manager from "../../controllers/manager";
import { AgentCategory, EntityType } from "../constants";
import { IEnemy } from "../enemies";
import Entity, { Agent, RenderData } from "../entity";
import { getCenter } from "../staticEntity";
import { ITower } from "../towers";

export const LIFETIME = 250;

class Flame implements Agent {
  public entity: Entity;
  public category = AgentCategory.Unknown;
  public time = 0;
  public renderData: RenderData = {};

  public sourceX: number;
  public sourceY: number;

  constructor(private source: ITower) {
    const [x, y] = getCenter(source);
    this.entity = new Entity(x, y, this);
    this.sourceX = x;
    this.sourceY = y;
  }

  dealDamage(enemy: IEnemy, damage: number) {
    this.renderData.update = true;

    if (this.time > LIFETIME) {
      Manager.Instance.getSurface().spawn(this);
    }

    this.time = 0;

    const direction = Math.atan2(
      enemy.entity.getX() + 0.5 - this.sourceX,
      enemy.entity.getY() + 0.5 - this.sourceY
    );
    this.entity.setRotation((direction * 180) / Math.PI);
    this.source.entity.setRotation(-this.entity.getRotation() + 180);

    this.entity.setX(enemy.entity.getAlignedX());
    this.entity.setY(enemy.entity.getAlignedY());

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
    return EntityType.Flame;
  }

  isVisible() {
    return true;
  }
}

export default Flame;
