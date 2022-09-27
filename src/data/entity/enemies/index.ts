import { PathMap } from "../../terrain/path/definitions";
import Path from "../../terrain/path/path";
import { Agent } from "../entity";
import EnemyAI from "./enemyAI";

export interface IEnemy extends Agent {
  initializePath(): void;
  AI: EnemyAI;
  getDamage(): number;
  getPath(): Path;
  getStatus(): Status;
  lightOnFire?: () => void;
}

export interface IEnemyStatics {
  readonly pathCosts: PathMap;
  readonly pathMultipliers: PathMap;
}

export enum Status {
  Normal,
  OnFire,
}
