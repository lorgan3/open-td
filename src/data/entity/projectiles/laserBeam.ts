import Manager from "../../manager";
import Tile from "../../terrain/tile";
import { IEnemy } from "../enemies";
import Entity, { Agent, AgentCategory, EntityType } from "../entity";

export const LIFETIME = 250;

class LaserBeam implements Agent {
  public entity: Entity;
  public category = AgentCategory.Unknown;
  public renderData = {};

  public time = 0;
  public targetX = 0;
  public targetY = 0;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX() + 0.5, tile.getY() + 0.5, this);
  }

  dealDamage(enemy: IEnemy, damage: number) {
    if (this.time > LIFETIME) {
      Manager.Instance.getSurface().spawn(this);
    }

    this.time = 0;

    this.targetX = enemy.entity.getX();
    this.targetY = enemy.entity.getY();
    const direction = Math.atan2(
      this.targetY - this.tile.getY() - 0.5,
      this.targetX - this.tile.getX() - 0.5
    );
    this.entity.setRotation((direction * 180) / Math.PI);

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

  getTile() {
    return this.tile;
  }

  isVisible() {
    return true;
  }
}

export default LaserBeam;
