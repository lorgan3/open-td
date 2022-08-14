import Manager from "../../manager";
import Tile from "../../terrain/tile";
import { IEnemy } from "../enemies";
import Entity, { Agent, AgentCategory, EntityType } from "../entity";

export const LIFETIME = 250;

class Flame implements Agent {
  public entity: Entity;
  public category = AgentCategory.Unknown;
  public time = 0;

  constructor(private tile: Tile, private damage: number) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  dealDamage(enemy: IEnemy) {
    if (this.time > LIFETIME) {
      Manager.Instance.getSurface().spawn(this);
    }

    this.time = 0;
    const direction = Math.atan2(
      enemy.entity.getY() - this.tile.getY(),
      enemy.entity.getX() - this.tile.getX()
    );
    this.entity.setRotation((direction * 180) / Math.PI);
    this.entity.setX(enemy.entity.getAlignedX());
    this.entity.setY(enemy.entity.getAlignedY());

    enemy.hit(this.damage);
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

  getTile() {
    return this.tile;
  }
}

export default Flame;
