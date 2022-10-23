import Manager from "../../manager";
import Tile, { TileWithStaticEntity } from "../../terrain/tile";
import { AgentCategory, EntityType } from "../entity";
import {
  coverTilesWithTowerSightLines,
  getDamageMultiplier,
  getSpeedMultiplier,
  ITower,
} from ".";
import { IEnemy } from "../enemies";
import Rail from "../projectiles/rail";
import { isSolid } from "../../terrain/collision";
import StaticEntity, { StaticAgent } from "../staticEntity";

const COOLDOWN = 5000;
const DAMAGE = 70;

class Railgun implements ITower {
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

    if (
      !Manager.Instance.consume(
        this,
        this.speedMultiplier,
        this.damageMultiplier
      )
    ) {
      return 0;
    }

    const damage = DAMAGE * this.damageMultiplier;
    const projectile = new Rail(this.tile, target, damage);
    Manager.Instance.getSurface().spawn(projectile);

    return damage;
  }

  spawn() {
    this.cleanupEventListener = coverTilesWithTowerSightLines(
      this,
      Railgun.range,
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
    return EntityType.Railgun;
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
}

export default Railgun;
