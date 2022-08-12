import Manager from "../../manager";
import Tile from "../../terrain/tile";
import Entity, { AgentCategory, EntityType } from "../entity";
import { coverTilesWithTowerSightLines, ITower } from ".";
import { IEnemy } from "../enemies";
import Rail from "../projectiles/rail";
import { isSolid } from "../../terrain/collision";

const RANGE = 30;
const COOLDOWN = 5000;
const DAMAGE = 100;

class Railgun implements ITower {
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
    const projectile = new Rail(this.tile, target, DAMAGE);
    Manager.Instance.getSurface().spawn(projectile);

    return DAMAGE;
  }

  despawn() {
    this.cleanupEventListener();
  }

  getCooldown() {
    return this.cooldown;
  }

  getType(): EntityType {
    return EntityType.Railgun;
  }
}

export default Railgun;
