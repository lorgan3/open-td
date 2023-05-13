import { IEnemy, Status } from ".";
import { staticCheckpointFactory } from "../../terrain/checkpoint/staticEntity";
import { TileType } from "../../terrain/constants";
import {
  DEFAULT_LAND_BASED_COSTS,
  DEFAULT_LAND_BASED_MULTIPLIERS,
  mapWithOverrides,
} from "../../terrain/path/definitions";
import Path from "../../terrain/path/path";
import Tile from "../../terrain/tile";
import { AgentCategory, DESTRUCTIBLE_ENTITIES, EntityType } from "../constants";
import Entity from "../entity";
import EnemyAI from "./enemyAI";

const destructibleEntitiesCopy = new Set(DESTRUCTIBLE_ENTITIES);
destructibleEntitiesCopy.delete(EntityType.Tree);
destructibleEntitiesCopy.delete(EntityType.Pine);
destructibleEntitiesCopy.delete(EntityType.Cactus);
const getStaticEntityCheckpoints = staticCheckpointFactory(
  1,
  destructibleEntitiesCopy
);

const ON_FIRE_TIME = 3000;
const STUN_TIME = 1000;
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
  public static readonly scale = 1;

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

  getScale() {
    return Runner.scale;
  }

  getPath() {
    return this.path;
  }

  getStatus() {
    return this.status;
  }

  tick(dt: number) {
    if (this.status !== Status.Normal) {
      this.statusDuration -= dt;
      if (this.statusDuration <= 0) {
        this.status = Status.Normal;
      } else if (this.status === Status.OnFire) {
        this.ai.hit(FIRE_DAMAGE * dt);
      }
    }

    this.ai.tick(dt);
  }

  isVisible() {
    return this.ai.isVisible();
  }

  lightOnFire() {
    this.status = Status.OnFire;
    this.statusDuration = ON_FIRE_TIME;
  }

  stun() {
    this.status = Status.Stunned;
    this.statusDuration = STUN_TIME;
  }

  getOffsetX() {
    return this.entity.getX();
  }

  getOffsetY() {
    return this.entity.getY();
  }
}

export default Runner;
