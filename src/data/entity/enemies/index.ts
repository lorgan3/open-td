import { PathMap } from "../../terrain/path/definitions";
import Path from "../../terrain/path/path";
import Tile from "../../terrain/tile";
import { EntityType } from "../constants";
import { Agent } from "../entity";
import EnemyAI from "./enemyAI";

export interface IEnemy extends Agent {
  initializePath(): void;
  AI: EnemyAI;
  getDamage(): number;
  getPath(): Path;
  getStatus(): Status;
  lightOnFire?: () => void;
  stun?: () => void;
}

export interface IEnemyStatics {
  readonly pathCosts: PathMap;
  readonly pathMultipliers: PathMap;
  readonly type: EntityType;
  readonly cost: number;
  new (tile: Tile, path: Path): IEnemy;
}

export enum Status {
  Normal,
  OnFire,
  Stunned,
}
