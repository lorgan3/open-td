import { IEnemy, Status } from ".";
import Path from "../../terrain/path/path";
import Tile from "../../terrain/tile";
import Entity, { AgentCategory, EntityType } from "../entity";
import EnemyAI from "./enemyAI";

const ON_FIRE_TIME = 3000;
const FIRE_DAMAGE = 0.01;

class Regular implements IEnemy {
  public entity: Entity;
  public category = AgentCategory.Enemy;
  private status = Status.Normal;
  private statusDuration = 0;

  private ai: EnemyAI;

  constructor(tile: Tile, private path: Path) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
    this.ai = new EnemyAI(this);
  }

  get AI() {
    return this.ai;
  }

  getDamage() {
    return 10;
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
    if (this.status === Status.OnFire) {
      this.statusDuration -= dt;
      if (this.statusDuration <= 0) {
        this.status = Status.Normal;
      } else {
        this.ai.hit(FIRE_DAMAGE * dt);
      }
    }

    this.ai.tick(dt);
  }

  isVisible() {
    return this.path.getTile().isDiscovered();
  }

  lightOnFire() {
    this.status = Status.OnFire;
    this.statusDuration = ON_FIRE_TIME;
  }
}

export default Regular;
