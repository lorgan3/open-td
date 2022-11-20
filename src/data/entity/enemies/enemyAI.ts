import { IEnemy } from ".";
import Manager from "../../controllers/manager";

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
      if (!this.enemy.isVisible()) {
        this.enemy.getPath().fastForward(this.enemy);
      }

      const { from, to, step } = this.enemy
        .getPath()
        .performStep(this.enemy, dt);
      this.enemy.entity.move(from, to, step);
      this.getTargeted(from, dt);
    }
  }

  attack(target: Agent) {
    if (target.hit && this.cooldown === 0) {
      target.hit!(
        this.enemy.getDamage() * Manager.Instance.getDamageMultiplier()
      );
      this.cooldown = this.enemy.isVisible() ? COOLDOWN : 0;
    }
  }

  interact(callback?: () => void, cooldown = COOLDOWN) {
    this.callback = callback;

    if (this.cooldown === 0 && this.enemy.isVisible()) {
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
    const index = this.enemy.getPath().getFuturePosition(time);

    const checkpoints = this.enemy.getPath().getCheckpoints();
    for (let i = 0; i < checkpoints.length; i++) {
      let checkpoint = checkpoints[i];

      if (checkpoint.index > index) {
        return index;
      }

      if (checkpoint.isBlocking) {
        return checkpoint.index - 1;
      }
    }

    return index;
  }
}

export default EnemyAI;
