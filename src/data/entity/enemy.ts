import Manager from "../manager";
import Path from "../terrain/path";
import Tile from "../terrain/tile";
import Entity, { Agent, AgentCategory, EntityType } from "./entity";

export interface IEnemy extends Agent {
  hit(damage: number): void;
  getPath(): Path;
  hp: number;
}

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

      Manager.Instance.getSurface().despawn(this);
      return;
    }

    const { from, to, step } = this.path.performStep(dt);
    this.entity.move(from, to, step);

    let tower = from.getAvailableTower();
    while (!!tower && this.predictedHp > 0) {
      this.predictedHp -= tower.fire(this);
      tower = from.getAvailableTower();
    }
  }

  hit(damage: number) {
    this.hp -= damage;

    if (this.hp <= 0) {
      Manager.Instance.getSurface().despawn(this);
    }
  }
}

export default Enemy;
