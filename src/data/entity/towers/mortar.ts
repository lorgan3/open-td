import Manager from "../../manager";
import Tile, { TileWithStaticEntity } from "../../terrain/tile";
import { AgentCategory, EntityType, RenderData } from "../entity";
import Rocket from "../projectiles/rocket";
import {
  coverTilesWithTowerSightLines,
  getDamageMultiplier,
  getSpeedMultiplier,
  ITower,
} from ".";
import { IEnemy } from "../enemies";
import StaticEntity, { StaticAgent } from "../staticEntity";

const COOLDOWN = 5000;
const DAMAGE = 50;

class Mortar implements ITower {
  public static readonly scale = 2;
  public static readonly range = 30;

  public entity: StaticEntity;
  public category = AgentCategory.Player;
  private cooldown = 0;
  private cleanupEventListener?: () => void;
  private hp = 80;
  private isEnabled = true;
  private speedMultiplier = 1;
  private damageMultiplier = 1;
  public renderData: RenderData = {};

  constructor(private tile: Tile) {
    this.entity = new StaticEntity(tile.getX(), tile.getY(), this);
  }

  tick(dt: number) {
    if (!this.isEnabled || this.cooldown <= 0) {
      return;
    }

    this.cooldown -= dt * this.speedMultiplier;
  }

  fire(target: IEnemy) {
    this.cooldown += COOLDOWN;

    const isPowered = Manager.Instance.consume(
      this,
      this.speedMultiplier,
      this.damageMultiplier
    );

    const damage = DAMAGE * (isPowered ? this.damageMultiplier : 0);
    const projectile = new Rocket(this, target, damage);
    Manager.Instance.getSurface().spawn(projectile);

    this.renderData.fired = true;

    return damage;
  }

  spawn() {
    this.cleanupEventListener = coverTilesWithTowerSightLines(
      this,
      Mortar.range
    );
  }

  despawn() {
    this.cleanupEventListener?.();
  }

  updateLinkedAgents(linkedAgents: Set<StaticAgent>) {
    this.speedMultiplier = getSpeedMultiplier(linkedAgents);
    this.damageMultiplier = getDamageMultiplier(linkedAgents);
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
    return this.tile as TileWithStaticEntity;
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

  isSpeedBoosted() {
    return this.speedMultiplier > 1;
  }

  isDamageBoosted() {
    return this.damageMultiplier > 1;
  }
}

export default Mortar;
