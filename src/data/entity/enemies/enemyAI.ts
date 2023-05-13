import { IEnemy, Status } from ".";
import Manager from "../../controllers/manager";

import Tile from "../../terrain/tile";
import { Agent } from "../entity";

export const COOLDOWN = 600;

class EnemyAI {
  private predictedHp;
  private cooldown = 0;
  private visibilities: boolean[] = [];
  private maxHp: number;

  private callback?: () => void;

  constructor(
    private enemy: IEnemy,
    public hp: number,
    private attackSpeed = COOLDOWN
  ) {
    this.predictedHp = hp;
    this.maxHp = hp;

    const surface = Manager.Instance.getSurface();
    this.visibilities = enemy
      .getPath()
      .getTiles()
      .map((tile) =>
        enemy.getScale() === 1
          ? tile.isDiscovered()
          : surface
              .getEntityTiles(tile.getX(), tile.getY(), enemy.getScale())
              .some((tile) => tile.isDiscovered())
      );
  }

  tick(dt: number) {
    if (this.cooldown < dt && this.callback) {
      this.callback();
      this.callback = undefined;
    }

    this.cooldown = Math.max(0, this.cooldown - dt);

    if (this.enemy.getPath().isPaused(this.enemy) && !this.isBusy()) {
      const to = this.enemy.getPath().getCurrentTile();
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
      if (!this.isVisible()) {
        this.enemy.getPath().fastForward(this.enemy);
      }

      const { from, to, step } = this.enemy
        .getPath()
        .performStep(this.enemy, dt);
      this.enemy.entity.move(from ?? to, to, step);

      if (from) {
        this.getTargeted(from, dt);
      }
    }
  }

  attack(target: Agent) {
    if (target.hit && this.cooldown === 0) {
      this.callback = () => {
        target.hit!(
          this.enemy.getDamage() * Manager.Instance.getDamageMultiplier()
        );
      };
      this.cooldown = this.isVisible() ? this.attackSpeed : 0;
    }
  }

  interact(callback?: () => void, cooldown = this.attackSpeed) {
    this.callback = callback;

    if (this.cooldown === 0 && this.isVisible()) {
      this.cooldown = cooldown;
    }
  }

  cancel() {
    this.cooldown = 0;
    this.callback = undefined;
  }

  private getTargeted(tile: Tile, dt: number) {
    if (this.predictedHp > 0 && this.isVisible()) {
      if (this.enemy.getScale() === 1) {
        for (let tower of tile.getAvailableTowers()) {
          this.predictedHp -= tower.fire(this.enemy, dt);

          if (this.predictedHp <= 0) {
            return;
          }
        }
        return;
      }

      const tiles = Manager.Instance.getSurface().getEntityTiles(
        tile.getX(),
        tile.getY(),
        this.enemy.getScale()
      );
      for (let tile of tiles) {
        for (let tower of tile.getAvailableTowers()) {
          this.predictedHp -= tower.fire(this.enemy, dt);

          if (this.predictedHp <= 0) {
            return;
          }
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

  isAttacking() {
    return this.cooldown !== 0;
  }

  isBusy() {
    return this.isAttacking() || this.enemy.getStatus() === Status.Stunned;
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

  isVisible() {
    return this.visibilities[this.enemy.getPath().getIndex() | 0] ?? true;
  }

  getHpPercent() {
    return this.hp / this.maxHp;
  }
}

export default EnemyAI;
