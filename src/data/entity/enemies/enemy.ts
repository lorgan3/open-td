import { IEnemy, Status } from ".";
import Manager from "../../manager";
import Path from "../../terrain/path";
import Tile from "../../terrain/tile";
import Entity, { Agent, AgentCategory, EntityType } from "../entity";

export const COOLDOWN = 600;
const DAMAGE = 10;
const ON_FIRE_TIME = 3000;
const FIRE_DAMAGE = 0.01;

class Enemy implements IEnemy {
  public entity: Entity;
  public category = AgentCategory.Enemy;
  private status = Status.Normal;
  private statusDuration = 0;

  public hp = 100;
  private predictedHp = this.hp;

  private cooldown = 0;

  private callback?: () => void;

  constructor(tile: Tile, private path: Path) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  getType(): EntityType {
    return EntityType.Slime;
  }

  getPath() {
    return this.path;
  }

  getStatus() {
    return this.status;
  }

  tick(dt: number) {
    if (this.cooldown < dt && this.callback) {
      this.callback();
      this.callback = undefined;
    }

    this.cooldown = Math.max(0, this.cooldown - dt);

    if (this.status === Status.OnFire) {
      this.statusDuration -= dt;
      if (this.statusDuration <= 0) {
        this.status = Status.Normal;
      } else {
        this.hit(FIRE_DAMAGE * dt);
      }
    }

    if (this.path.isPaused(this) && !this.isBusy()) {
      const to = this.path.getTile();
      this.entity.setX(to.getX());
      this.entity.setY(to.getY());

      const checkpoint = this.path.getNextCheckpoint();
      if (checkpoint) {
        checkpoint.process(this.path.getTiles(), this, dt);
      }
    }

    if (this.isBusy()) {
      this.getTargeted(this.path.getCurrentTile(), dt);
    } else {
      const { from, to, step } = this.path.performStep(
        this,
        this.isVisible() ? dt : dt * 10
      );
      this.entity.move(from, to, step);
      this.getTargeted(from, dt);
    }
  }

  attack(target: Agent) {
    if (target.hit && this.cooldown === 0) {
      target.hit!(DAMAGE);
      this.cooldown = COOLDOWN;
    }
  }

  interact(callback?: () => void, cooldown = COOLDOWN) {
    this.callback = callback;

    if (this.cooldown === 0) {
      this.cooldown = cooldown;
    }
  }

  private getTargeted(tile: Tile, dt: number) {
    if (this.predictedHp > 0) {
      for (let tower of tile.getAvailableTowers()) {
        this.predictedHp -= tower.fire(this, dt);

        if (this.predictedHp <= 0) {
          break;
        }
      }
    }
  }

  hit(damage: number) {
    this.hp -= damage;

    if (this.hp < this.predictedHp) {
      this.predictedHp = this.hp;
    }

    if (this.hp <= 0) {
      Manager.Instance.despawnEnemy(this);
    }
  }

  miss(damage: number) {
    this.predictedHp += damage;
  }

  isBusy() {
    return this.cooldown !== 0;
  }

  isVisible() {
    return this.path.getTile().isDiscovered();
  }

  getFuturePosition(time: number) {
    if (this.cooldown > time) {
      return this.path.getIndex();
    }

    return this.path.getFuturePosition(time - this.cooldown);
  }

  lightOnFire() {
    this.status = Status.OnFire;
    this.statusDuration = ON_FIRE_TIME;
  }
}

export default Enemy;
