import Manager from "../manager";
import { createStoneSurface } from "../terrain/fill";
import Tile, { FREE_TILES_INCLUDING_WATER } from "../terrain/tile";
import Entity, { AgentCategory, EntityType, StaticAgent } from "./entity";
import Shockwave from "./projectiles/shockwave";

const INVINCIBLE_TIME = 1000;
const DAMAGE = 200;

class Base implements StaticAgent {
  public entity: Entity;
  public category = AgentCategory.Player;
  public hp = 30;
  private invincibleTime = 0;

  private baseParts = new Set<StaticAgent>();

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
    this.baseParts.add(this);
  }

  tick(dt: number) {
    this.invincibleTime = Math.max(0, this.invincibleTime - dt);
  }

  getType(): EntityType {
    return EntityType.Base;
  }

  getTile() {
    return this.tile;
  }

  updateTile(tile: Tile) {
    this.tile = tile;
  }

  getHp() {
    return this.hp;
  }

  spawn() {
    Manager.Instance.getVisibilityController().registerAgent(this);
    createStoneSurface(this.tile, 5);
  }

  despawn() {
    Manager.Instance.getVisibilityController().removeAgent(this);
  }

  hit(damage: number) {
    if (this.invincibleTime > 0 || this.hp <= 0) {
      return;
    }

    this.hp -= damage;

    if (this.hp <= 0) {
      Manager.Instance.showMessage("You lose!", {
        override: true,
        closable: false,
      });
    } else {
      this.invincibleTime = INVINCIBLE_TIME;
      this.shockwave();
    }

    Manager.Instance.triggerStatUpdate();
  }

  isVisible() {
    return true;
  }

  isDestroyed() {
    return this.hp <= 0;
  }

  addPart(part: StaticAgent) {
    this.baseParts.add(part);
  }

  removePart(part: StaticAgent) {
    this.baseParts.delete(part);
  }

  getParts() {
    return this.baseParts;
  }

  private shockwave() {
    const surface = Manager.Instance.getSurface();
    const targets = new Map<string, [Tile, Tile]>();

    this.baseParts.forEach((agent) => {
      for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
          if (i === 0 && j === 0) {
            continue;
          }

          const tile = surface.getTile(
            agent.getTile().getX() + i,
            agent.getTile().getY() + j
          );
          if (
            tile &&
            !targets.has(tile.getHash()) &&
            FREE_TILES_INCLUDING_WATER.has(tile.getType())
          ) {
            targets.set(tile.getHash(), [agent.getTile(), tile]);
          }
        }
      }
    });

    targets.forEach(([fromTile, toTile]) => {
      const shockwave = new Shockwave(fromTile, toTile, DAMAGE);
      surface.spawn(shockwave);
    });
  }
}

export default Base;
