import { coverTilesWithTowerSightLines, ITower } from ".";
import Manager from "../../manager";
import { isSolid } from "../../terrain/collision";
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
  private cleanupEventListener: () => void;

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
    const bullet = new Bullet(this.tile, target, DAMAGE);
    Manager.Instance.getSurface().spawn(bullet);

    return DAMAGE;
  }

  despawn() {
    this.cleanupEventListener();
  }

  getCooldown() {
    return this.cooldown;
  }

  getType(): EntityType {
    return EntityType.Tower;
  }
}

export default Tower;
