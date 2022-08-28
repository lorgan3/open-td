import Manager from "../manager";
import Tile from "../terrain/tile";
import Entity, { Agent, AgentCategory, EntityType } from "./entity";
import Shockwave from "./projectiles/shockwave";

const INVINCIBLE_TIME = 1000;
const DAMAGE = 200;

class Base implements Agent {
  public entity: Entity;
  public category = AgentCategory.Player;
  public hp = 30;
  private invincibleTime = 0;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
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

  getHp() {
    return this.hp;
  }

  spawn() {
    Manager.Instance.getVisibilityController().registerAgent(this);
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

  private shockwave() {
    const surface = Manager.Instance.getSurface();
    const targets = new Set<Tile>();

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        if (i === 0 && j === 0) {
          continue;
        }

        const tile = surface.getTile(
          this.tile.getX() + i,
          this.tile.getY() + j
        );
        if (tile) {
          targets.add(tile);
        }
      }
    }

    targets.forEach((target) => {
      const shockwave = new Shockwave(this.tile, target, DAMAGE);
      surface.spawn(shockwave);
    });
  }
}

export default Base;
