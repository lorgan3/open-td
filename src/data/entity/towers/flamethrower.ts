import { coverTilesWithTowerSightLines, getSpeedMultiplier, ITower } from ".";
import Manager from "../../manager";
import { isSolid } from "../../terrain/collision";
import Tile from "../../terrain/tile";
import { IEnemy } from "../enemies";
import Entity, { AgentCategory, EntityType, StaticAgent } from "../entity";
import Flame from "../projectiles/flame";

const RANGE = 3;
const COOLDOWN = 1;
const DAMAGE = 0.05;

class Flamethrower implements ITower {
  public entity: Entity;
  public category = AgentCategory.Player;
  private cooldown = 0;
  private cleanupEventListener?: () => void;
  private flame?: Flame;
  private hp = 200;
  private isEnabled = true;
  private damageMultiplier = 1;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  tick(dt: number) {
    if (!this.isEnabled) {
      return;
    }

    this.cooldown = Math.max(0, this.cooldown - dt);
  }

  fire(target: IEnemy, dt: number) {
    this.cooldown = COOLDOWN;

    if (!this.flame) {
      this.flame = new Flame(this.tile, DAMAGE * this.damageMultiplier * dt);
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

  updateLinkedAgents(linkedAgents: Set<StaticAgent>) {
    this.damageMultiplier = getSpeedMultiplier(linkedAgents);
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

  updateTile(tile: Tile) {
    this.tile = tile;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.cooldown = COOLDOWN;
    this.isEnabled = false;
  }
}

export default Flamethrower;
