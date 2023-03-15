import { IEnemy, Status } from ".";
import { combineCheckpoints } from "../../terrain/checkpoint";
import { staticCheckpointFactory } from "../../terrain/checkpoint/staticEntity";
import { getTreeCheckpoints } from "../../terrain/checkpoint/tree";
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
const getStaticEntityCheckpoints = staticCheckpointFactory(
  2,
  destructibleEntitiesCopy
);

const ON_FIRE_TIME = 3000;
const STUN_TIME = 1500;
const FIRE_DAMAGE = 0.01;
const SPEED = 0.01;
const HP = 350;

class Behemoth implements IEnemy {
  public static readonly pathCosts = DEFAULT_LAND_BASED_COSTS;
  public static readonly pathMultipliers = mapWithOverrides(
    DEFAULT_LAND_BASED_MULTIPLIERS,
    { [TileType.Water]: 2 }
  );
  public static readonly type = EntityType.Behemoth;
  public static readonly cost = 32;
  public static readonly scale = 2;

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
    this.path.setSpeed(SPEED / Behemoth.scale);
    this.path.setCheckpoints(
      combineCheckpoints(
        this.path.getTiles(),
        getTreeCheckpoints,
        getStaticEntityCheckpoints
      )
    );
  }

  get AI() {
    return this.ai;
  }

  getDamage() {
    return 10;
  }

  getType(): EntityType {
    return Behemoth.type;
  }

  getScale() {
    return Behemoth.scale;
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
    return this.path.getTile().isDiscovered();
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
    return this.entity.getX() + 0.5;
  }

  getOffsetY() {
    return this.entity.getY() + 0.5;
  }
}

export default Behemoth;
