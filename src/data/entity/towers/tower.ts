import {
  coverTilesWithTowerSightLines,
  getDamageMultiplier,
  getSpeedMultiplier,
  ITower,
} from ".";
import Manager from "../../controllers/manager";
import { isSolid } from "../../terrain/collision";
import Tile, { TileWithStaticEntity } from "../../terrain/tile";
import Bullet from "../projectiles/bullet";
import { IEnemy } from "../enemies";
import { RenderData } from "../entity";
import StaticEntity, { StaticAgent } from "../staticEntity";
import { AgentCategory, EntityType } from "../constants";

const COOLDOWN = 500;
const DAMAGE = 10;

class Tower implements ITower {
  public static readonly scale = 2;
  public static readonly range = 10;

  public entity: StaticEntity;
  public category = AgentCategory.Player;
  private cooldown = 0;
  private cleanupEventListener?: () => void;
  private hp = 50;
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

    const damage = DAMAGE * (isPowered ? this.damageMultiplier : 1);
    const bullet = new Bullet(this, target, damage);
    Manager.Instance.getSurface().spawn(bullet);

    this.renderData.fired = true;

    return damage;
  }

  spawn() {
    this.cleanupEventListener = coverTilesWithTowerSightLines(
      this,
      Tower.range,
      isSolid
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
    return EntityType.Tower;
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

export default Tower;
