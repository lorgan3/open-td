import { ITower } from ".";
import Manager from "../../manager";
import Tile from "../../terrain/tile";
import Bullet from "../bullet";
import { IEnemy } from "../enemies";
import Entity, { AgentCategory, EntityType } from "../entity";

const RANGE = 9;
const COOLDOWN = 500;
const DAMAGE = 10;

class Tower implements ITower {
  public entity: Entity;
  public category = AgentCategory.Player;
  private cooldown = 0;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);

    Manager.Instance.getSurface().forCircle(
      tile.getX(),
      tile.getY(),
      RANGE,
      (tile) => tile.addTower(this)
    );
  }

  tick(dt: number) {
    this.cooldown = Math.max(0, this.cooldown - dt);
  }

  fire(target: IEnemy) {
    this.cooldown = COOLDOWN;
    const bullet = new Bullet(this.tile, target, DAMAGE);
    Manager.Instance.getSurface().spawn(bullet);

    return DAMAGE;
  }

  getCooldown() {
    return this.cooldown;
  }

  getType(): EntityType {
    return EntityType.Tower;
  }
}

export default Tower;