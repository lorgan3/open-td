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
  private cleanupEventListener: () => void;
  private flame?: Flame;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
    this.cleanupEventListener = coverTilesWithTowerSightLines(
      this,
      RANGE,
      isSolid
    );
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

  despawn() {
    this.cleanupEventListener();
  }

  getCooldown() {
    return this.cooldown;
  }

  getType(): EntityType {
    return EntityType.Flamethrower;
  }
}

export default Flamethrower;
