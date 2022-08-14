import Manager from "../../manager";
import Path from "../../terrain/path";
import Tile from "../../terrain/tile";
import Entity, { Agent, AgentCategory, EntityType } from "../entity";

export const COOLDOWN = 600;
const DAMAGE = 10;

class Enemy implements Agent {
  public entity: Entity;
  public category = AgentCategory.Enemy;

  public hp = 1000;
  private predictedHp = this.hp;

  private cooldown = 0;

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
    this.cooldown = Math.max(0, this.cooldown - dt);

    if (this.path.isPaused()) {
      const to = this.path.getTile();
      this.entity.setX(to.getX());
      this.entity.setY(to.getY());

      const target = this.path.getNextCheckpoint().getStaticEntity();
      if (target?.getAgent().hit && this.cooldown === 0) {
        target.getAgent().hit!(DAMAGE);
        this.cooldown = COOLDOWN;
      }
    }

    if (this.isAttacking()) {
      this.getTargeted(this.path.getCurrentTile());
    } else {
      const { from, to, step } = this.path.performStep(dt);
      this.entity.move(from, to, step);
      this.getTargeted(from);
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

  isAttacking() {
    return this.cooldown !== 0;
  }
}

export default Enemy;
