import { IEnemy } from ".";
import Manager from "../../manager";

import Tile from "../../terrain/tile";
import { Agent } from "../entity";

export const COOLDOWN = 600;

class EnemyAI {
  private predictedHp;
  private cooldown = 0;

  private callback?: () => void;

  constructor(private enemy: IEnemy, public hp: number) {
    this.predictedHp = hp;
  }

  tick(dt: number) {
    if (this.cooldown < dt && this.callback) {
      this.callback();
      this.callback = undefined;
    }

    this.cooldown = Math.max(0, this.cooldown - dt);

    if (this.enemy.getPath().isPaused(this.enemy) && !this.isBusy()) {
      const to = this.enemy.getPath().getTile();
      this.enemy.entity.setX(to.getX());
      this.enemy.entity.setY(to.getY());

      const checkpoint = this.enemy.getPath().getNextCheckpoint();
      if (checkpoint) {
        checkpoint.process(this.enemy.getPath().getTiles(), this.enemy, dt);
      }
    }

    if (this.isBusy()) {
      this.getTargeted(this.enemy.getPath().getCurrentTile(), dt);
    } else {
      const { from, to, step } = this.enemy
        .getPath()
        .performStep(this.enemy, this.enemy.isVisible() ? dt : dt * 10);
      this.enemy.entity.move(from, to, step);
      this.getTargeted(from, dt);
    }
  }

  attack(target: Agent) {
    if (target.hit && this.cooldown === 0) {
      target.hit!(this.enemy.getDamage());
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
    if (this.predictedHp > 0 && this.enemy.isVisible()) {
      for (let tower of tile.getAvailableTowers()) {
        this.predictedHp -= tower.fire(this.enemy, dt);

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
      Manager.Instance.despawnEnemy(this.enemy);
    }
  }

  miss(damage: number) {
    this.predictedHp += damage;
  }

  isBusy() {
    return this.cooldown !== 0;
  }

  getFuturePosition(time: number) {
    if (this.cooldown > time) {
      return this.enemy.getPath().getIndex();
    }

    return this.enemy.getPath().getFuturePosition(time - this.cooldown);
  }
}

export default EnemyAI;