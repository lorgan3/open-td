import { IEnemy, Status } from ".";
import { staticCheckpointFactory } from "../../terrain/checkpoint/staticEntity";
import {
  DEFAULT_LAND_BASED_COSTS,
  DEFAULT_LAND_BASED_MULTIPLIERS,
  mapWithOverrides,
} from "../../terrain/path/definitions";
import Path from "../../terrain/path/path";
import Tile, { TileType } from "../../terrain/tile";
import Entity, {
  AgentCategory,
  DESTRUCTIBLE_ENTITIES,
  EntityType,
} from "../entity";
import EnemyAI from "./enemyAI";

const destructibleEntitiesCopy = new Set(DESTRUCTIBLE_ENTITIES);
destructibleEntitiesCopy.delete(EntityType.Tree);
const getStaticEntityCheckpoints = staticCheckpointFactory(
  destructibleEntitiesCopy
);

const ON_FIRE_TIME = 3000;
const FIRE_DAMAGE = 0.01;
const SPEED = 0.025;
const HP = 30;

class Runner implements IEnemy {
  public static readonly pathCosts = mapWithOverrides(
    DEFAULT_LAND_BASED_COSTS,
    { [TileType.Tree]: 3 }
  );
  public static readonly pathMultipliers = mapWithOverrides(
    DEFAULT_LAND_BASED_MULTIPLIERS,
    { [TileType.Water]: 2 }
  );
  public static readonly type = EntityType.Runner;
  public static readonly cost = 5;

  public entity: Entity;
  public category = AgentCategory.Enemy;
  private status = Status.Normal;
  private statusDuration = 0;
  public renderData = {};

  private ai: EnemyAI;

  constructor(tile: Tile, private path: Path) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
    this.ai = new EnemyAI(this, HP);
  }

  initializePath() {
    this.path.setSpeed(SPEED);
    this.path.setCheckpoints(getStaticEntityCheckpoints(this.path.getTiles()));
  }

  get AI() {
    return this.ai;
  }

  getDamage() {
    return 4;
  }

  getType(): EntityType {
    return Runner.type;
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

export default Runner;
