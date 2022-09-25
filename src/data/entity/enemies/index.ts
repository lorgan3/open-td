import Path from "../../terrain/path/path";
import { Agent } from "../entity";
import EnemyAI from "./enemyAI";

export interface IEnemy extends Agent {
  AI: EnemyAI;
  getDamage(): number;
  getPath(): Path;
  getStatus(): Status;
  lightOnFire?: () => void;
}

export enum Status {
  Normal,
  OnFire,
}
