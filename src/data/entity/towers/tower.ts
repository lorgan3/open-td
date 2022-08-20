import { coverTilesWithTowerSightLines, ITower } from ".";
import Manager from "../../manager";
import { isSolid } from "../../terrain/collision";
import Tile from "../../terrain/tile";
import Bullet from "../projectiles/bullet";
import { IEnemy } from "../enemies";
import Entity, { AgentCategory, EntityType } from "../entity";

const RANGE = 9;
const COOLDOWN = 500;
const DAMAGE = 10;

class Tower implements ITower {
  public entity: Entity;
  public category = AgentCategory.Player;
  private cooldown = 0;
  private cleanupEventListener?: () => void;
  private hp = 50;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
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

  spawn() {
    this.cleanupEventListener = coverTilesWithTowerSightLines(
      this,
      RANGE,
      isSolid
    );
  }

  despawn() {
    this.cleanupEventListener?.();
  }

  getCooldown() {
    return this.cooldown;
  }

  getType(): EntityType {
    return EntityType.Tower;
  }

  hit(damage: number) {
    this.hp -= damage;

    if (this.hp <= 0) {
      Manager.Instance.getSurface().despawnStatic(this);
    }
  }
}

export default Tower;
