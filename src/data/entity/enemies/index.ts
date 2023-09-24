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
  getScale: () => number;
  getOffsetX(): number;
  getOffsetY(): number;
}

export const isEnemy = (agent: Agent): agent is IEnemy => {
  return "AI" in agent;
};

export interface IEnemyStatics {
  readonly pathCosts: PathMap;
  readonly pathMultipliers: PathMap;
  readonly type: EntityType;
  readonly cost: number;
  readonly scale: number;
  readonly maxDiagonalCost?: number;
  new (tile: Tile, path: Path): IEnemy;
}

export enum Status {
  Normal,
  OnFire,
  Stunned,
}
