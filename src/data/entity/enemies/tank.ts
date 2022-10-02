import { IEnemy, Status } from ".";
import { combineCheckpoints, maybe } from "../../terrain/checkpoint";
import { getDirtCheckpoints } from "../../terrain/checkpoint/dirt";
import { staticCheckpointFactory } from "../../terrain/checkpoint/staticEntity";
import {
  DEFAULT_LAND_BASED_COSTS,
  DEFAULT_LAND_BASED_MULTIPLIERS,
} from "../../terrain/path/definitions";
import Path from "../../terrain/path/path";
import Tile from "../../terrain/tile";
import Entity, { AgentCategory, EntityType } from "../entity";
import EnemyAI from "./enemyAI";

const getStaticEntityCheckpoints = staticCheckpointFactory();

const ON_FIRE_TIME = 3000;
const FIRE_DAMAGE = 0.01;
const SPEED = 0.008;
const HP = 200;

class Tank implements IEnemy {
  public static readonly pathCosts = DEFAULT_LAND_BASED_COSTS;
  public static readonly pathMultipliers = DEFAULT_LAND_BASED_MULTIPLIERS;
  public static readonly type = EntityType.Tank;
  public static readonly cost = 20;

  public entity: Entity;
  public category = AgentCategory.Enemy;
  private status = Status.Normal;
  private statusDuration = 0;

  private ai: EnemyAI;

  constructor(tile: Tile, private path: Path) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
    this.ai = new EnemyAI(this, HP);
  }

  initializePath() {
    this.path.setSpeed(SPEED);
    this.path.setCheckpoints(
      combineCheckpoints(
        this.path.getTiles(),
        getStaticEntityCheckpoints,
        maybe(0.5, getDirtCheckpoints)
      )
    );
  }

  get AI() {
    return this.ai;
  }

  getDamage() {
    return 15;
  }

  getType(): EntityType {
    return Tank.type;
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

export default Tank;
