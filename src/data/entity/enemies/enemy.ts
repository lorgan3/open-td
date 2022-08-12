import Manager from "../../manager";
import Path from "../../terrain/path";
import Tile from "../../terrain/tile";
import Entity, { Agent, AgentCategory, EntityType } from "../entity";

class Enemy implements Agent {
  public entity: Entity;
  public category = AgentCategory.Enemy;

  public hp = 100;
  private predictedHp = this.hp;

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
    if (this.path.isDone()) {
      const to = this.path.getTile();
      this.entity.setX(to.getX());
      this.entity.setY(to.getY());

      Manager.Instance.despawnEnemy(this);
      return;
    }

    const { from, to, step } = this.path.performStep(dt);
    this.entity.move(from, to, step);

    if (this.predictedHp >= 0) {
      for (let tower of from.getAvailableTowers()) {
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
}

export default Enemy;
