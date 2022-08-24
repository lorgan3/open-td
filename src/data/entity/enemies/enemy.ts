import { IEnemy } from ".";
import Manager from "../../manager";
import Path from "../../terrain/path";
import Tile from "../../terrain/tile";
import Entity, { Agent, AgentCategory, EntityType } from "../entity";

export const COOLDOWN = 600;
const DAMAGE = 10;

class Enemy implements IEnemy {
  public entity: Entity;
  public category = AgentCategory.Enemy;

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

  tick(dt: number) {
    if (this.cooldown < dt && this.callback) {
      this.callback();
      this.callback = undefined;
    }

    this.cooldown = Math.max(0, this.cooldown - dt);

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
      this.getTargeted(this.path.getCurrentTile());
    } else {
      const { from, to, step } = this.path.performStep(
        this,
        this.isVisible() ? dt : dt * 10
      );
      this.entity.move(from, to, step);
      this.getTargeted(from);
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

  private getTargeted(tile: Tile) {
    if (this.predictedHp >= 0) {
      for (let tower of tile.getAvailableTowers()) {
        this.predictedHp -= tower.fire(this);

        if (this.predictedHp <= 0) {
          break;
        }
      }
    }
  }

  hit(damage: number) {
    this.hp -= damage;

    if (this.hp <= 0) {
      Manager.Instance.despawnEnemy(this);
    }
  }

  isBusy() {
    return this.cooldown !== 0;
  }

  isVisible() {
    return this.path.getTile().isDiscovered();
  }

  getFuturePosition(time: number) {
    if (this.isBusy()) {
      return this.path.getIndex();
    }

    return this.path.getFuturePosition(time);
  }
}

export default Enemy;
