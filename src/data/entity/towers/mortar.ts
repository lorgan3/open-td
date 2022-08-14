import Manager from "../../manager";
import Tile from "../../terrain/tile";
import Entity, { AgentCategory, EntityType } from "../entity";
import Rocket from "../projectiles/rocket";
import { coverTilesWithTowerSightLines, ITower } from ".";
import { IEnemy } from "../enemies";

const RANGE = 30;
const COOLDOWN = 5000;
const DAMAGE = 100;

class Mortar implements ITower {
  public entity: Entity;
  public category = AgentCategory.Player;
  private cooldown = 0;
  private cleanupEventListener: () => void;
  private hp = 100;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
    this.cleanupEventListener = coverTilesWithTowerSightLines(this, RANGE);
  }

  tick(dt: number) {
    this.cooldown = Math.max(0, this.cooldown - dt);
  }

  fire(target: IEnemy) {
    this.cooldown = COOLDOWN;
    const projectile = new Rocket(this.tile, target, DAMAGE);
    Manager.Instance.getSurface().spawn(projectile);

    return 0; // This tower cannot guarantee the projectile will hit.
  }

  despawn() {
    this.cleanupEventListener();
  }

  getCooldown() {
    return this.cooldown;
  }

  getType(): EntityType {
    return EntityType.Mortar;
  }

  hit(damage: number) {
    this.hp -= damage;

    if (this.hp <= 0) {
      Manager.Instance.getSurface().despawnStatic(this);
    }
  }
}

export default Mortar;
