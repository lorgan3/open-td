import Manager from "../manager";
import { DEFAULT_COSTS } from "../terrain/pathfinder";
import Tile from "../terrain/tile";
import Entity, { Agent, EntityType } from "./entity";
import { ITower } from "./tower";
import { getPathSection } from "./util";

export interface IEnemy extends Agent {
  setPath(tiles: Tile[]): void;
  hit(damage: number): void;
  getPath(): Tile[];
  getPathIndex(): number;
  speed: number;
  hp: number;
}

class Enemy implements Agent {
  public entity: Entity;
  private path: Tile[] = [];
  private pathIndex = 0;

  public speed = 0.01;
  public hp = 100;
  private predictedHp = this.hp;

  constructor(tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  getType(): EntityType {
    return EntityType.Slime;
  }

  setPath(tiles: Tile[]) {
    this.path = tiles;
    this.pathIndex = 0;
  }

  getPath() {
    return this.path;
  }

  getPathIndex() {
    return this.pathIndex;
  }

  tick(dt: number) {
    if (this.path.length) {
      if (this.pathIndex >= this.path.length - 1) {
        const to = this.path[this.path.length - 1];
        this.entity.setX(to.getX());
        this.entity.setY(to.getY());
        this.path = [];

        Manager.Instance.getSurface().despawn(this);
        return;
      }

      const { from, to, step } = getPathSection(
        this.path,
        this.pathIndex,
        this.speed * dt,
        DEFAULT_COSTS
      );
      this.entity.move(from, to, step);

      this.pathIndex +=
        (this.speed * dt) /
        (DEFAULT_COSTS[step > 0.5 ? to.getType() : from.getType()] ?? 1);

      let tower: ITower | undefined;
      do {
        tower = from.getAvailableTower();
        if (tower) {
          this.predictedHp -= tower.fire(this);
        }
      } while (!!tower && this.predictedHp > 0);
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
