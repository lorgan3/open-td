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
import { isSolid } from "../../terrain/collision";
import LaserBeam from "../projectiles/laserBeam";
import StaticEntity, { StaticAgent } from "../staticEntity";

const RANGE = 15;
const COOLDOWN = 1;
const DAMAGE = 0.05;

class Laser implements ITower {
  public entity: StaticEntity;
  public category = AgentCategory.Player;
  private cooldown = 0;
  private cleanupEventListener?: () => void;
  private laserBeam?: LaserBeam;
  private hp = 100;
  private isEnabled = true;
  private damageMultiplier = 1;

  constructor(private tile: Tile) {
    this.entity = new StaticEntity(tile.getX(), tile.getY(), this);
  }

  tick(dt: number) {
    if (!this.isEnabled || this.cooldown <= 0) {
      return;
    }

    this.cooldown = Math.max(0, this.cooldown - dt);
  }

  fire(target: IEnemy, dt: number) {
    this.cooldown = COOLDOWN;

    if (!Manager.Instance.consumeContinuous(this, dt, this.damageMultiplier)) {
      return 0;
    }

    const damage = DAMAGE * this.damageMultiplier * dt;

    if (!this.laserBeam) {
      this.laserBeam = new LaserBeam(this.tile);
      Manager.Instance.getSurface().spawn(this.laserBeam);
    }

    this.laserBeam.dealDamage(target, damage);

    return damage;
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
    this.damageMultiplier =
      getSpeedMultiplier(linkedAgents) * getDamageMultiplier(linkedAgents);
  }

  getCooldown() {
    return this.cooldown;
  }

  getType(): EntityType {
    return EntityType.Laser;
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

export default Laser;
