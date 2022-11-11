import Manager from "../../manager";
import Tile from "../../terrain/tile";
import { IEnemy } from "../enemies";
import Entity, {
  Agent,
  AgentCategory,
  EntityType,
  RenderData,
} from "../entity";

export const LIFETIME = 250;

class Flame implements Agent {
  public entity: Entity;
  public category = AgentCategory.Unknown;
  public time = 0;
  public renderData: RenderData = {};

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX() + 0.5, tile.getY() + 0.5, this);
  }

  dealDamage(enemy: IEnemy, damage: number) {
    this.renderData.update = true;

    if (this.time > LIFETIME) {
      Manager.Instance.getSurface().spawn(this);
    }

    this.time = 0;

    const direction = Math.atan2(
      enemy.entity.getX() + 0.25 - (this.tile.getX() + 0.5),
      enemy.entity.getY() + 0.25 - (this.tile.getY() + 0.5)
    );
    this.entity.setRotation((direction * 180) / Math.PI);
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

  getTile() {
    return this.tile;
  }

  isVisible() {
    return true;
  }
}

export default Flame;
