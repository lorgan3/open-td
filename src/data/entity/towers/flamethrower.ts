import { coverTilesWithTowerSightLines, ITower } from ".";
import Manager from "../../manager";
import { isSolid } from "../../terrain/collision";
import Tile from "../../terrain/tile";
import { IEnemy } from "../enemies";
import Entity, { AgentCategory, EntityType } from "../entity";
import Flame from "../projectiles/flame";

const RANGE = 3;
const COOLDOWN = 1;
const DAMAGE = 0.5;

class Flamethrower implements ITower {
  public entity: Entity;
  public category = AgentCategory.Player;
  private cooldown = 0;
  private cleanupEventListener?: () => void;
  private flame?: Flame;
  private hp = 200;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  tick(dt: number) {
    this.cooldown = Math.max(0, this.cooldown - dt);
  }

  fire(target: IEnemy) {
    this.cooldown = COOLDOWN;

    if (!this.flame) {
      this.flame = new Flame(this.tile, DAMAGE);
      Manager.Instance.getSurface().spawn(this.flame);
    }

    this.flame.dealDamage(target);

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
    return EntityType.Flamethrower;
  }

  hit(damage: number) {
    this.hp -= damage;

    if (this.hp <= 0) {
      Manager.Instance.getSurface().despawnStatic(this);
    }
  }

  isVisible() {
    return true;
  }

  getTile() {
    return this.tile;
  }
}

export default Flamethrower;
