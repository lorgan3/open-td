import Manager from "../../manager";
import Tile from "../../terrain/tile";
import Entity, { AgentCategory, EntityType, StaticAgent } from "../entity";
import Rocket from "../projectiles/rocket";
import { coverTilesWithTowerSightLines, getSpeedMultiplier, ITower } from ".";
import { IEnemy } from "../enemies";

const RANGE = 30;
const COOLDOWN = 5000;
const DAMAGE = 100;

class Mortar implements ITower {
  public entity: Entity;
  public category = AgentCategory.Player;
  private cooldown = 0;
  private cleanupEventListener?: () => void;
  private hp = 100;
  private isEnabled = true;
  private speedMultiplier = 1;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  tick(dt: number) {
    if (!this.isEnabled) {
      return;
    }

    this.cooldown = Math.max(0, this.cooldown - dt * this.speedMultiplier);
  }

  fire(target: IEnemy) {
    this.cooldown = COOLDOWN;
    const projectile = new Rocket(this.tile, target, DAMAGE);
    Manager.Instance.getSurface().spawn(projectile);

    return DAMAGE;
  }

  spawn() {
    this.cleanupEventListener = coverTilesWithTowerSightLines(this, RANGE);
  }

  despawn() {
    this.cleanupEventListener?.();
  }

  updateLinkedAgents(linkedAgents: Set<StaticAgent>) {
    this.speedMultiplier = getSpeedMultiplier(linkedAgents);
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

export default Mortar;
