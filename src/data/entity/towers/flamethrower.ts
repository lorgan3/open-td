import {
  coverTilesWithTowerSightLines,
  getDamageMultiplier,
  getSpeedMultiplier,
  ITower,
} from ".";
import Manager from "../../controllers/manager";
import { isSolid } from "../../terrain/collision";
import Tile, { TileWithStaticEntity } from "../../terrain/tile";
import { IEnemy } from "../enemies";
import { AgentCategory, EntityType, RenderData } from "../entity";
import Flame from "../projectiles/flame";
import StaticEntity, { StaticAgent } from "../staticEntity";

const COOLDOWN = 1;
const DAMAGE = 0.04;

class Flamethrower implements ITower {
  public static readonly scale = 2;
  public static readonly range = 6;

  public entity: StaticEntity;
  public category = AgentCategory.Player;
  private cooldown = 0;
  private cleanupEventListener?: () => void;
  private flame?: Flame;
  private hp = 160;
  private isEnabled = true;
  private speedMultiplier = 1;
  private damageMultiplier = 1;
  public renderData: RenderData = {};

  constructor(private tile: Tile) {
    this.entity = new StaticEntity(tile.getX(), tile.getY(), this);
  }

  tick(dt: number) {
    if (!this.isEnabled) {
      return;
    }

    this.cooldown = Math.max(0, this.cooldown - dt);
  }

  fire(target: IEnemy, dt: number) {
    this.cooldown = COOLDOWN;

    const isPowered = Manager.Instance.consumeContinuous(
      this,
      dt,
      this.damageMultiplier * this.speedMultiplier
    );

    const damage =
      DAMAGE *
      (isPowered ? this.damageMultiplier * this.speedMultiplier : 1) *
      dt;
    if (!this.flame) {
      this.flame = new Flame(this);
      Manager.Instance.getSurface().spawn(this.flame);
    }

    this.flame.dealDamage(target, damage);

    this.renderData.fired = true;

    return damage;
  }

  spawn() {
    this.cleanupEventListener = coverTilesWithTowerSightLines(
      this,
      Flamethrower.range,
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

export default Flamethrower;
