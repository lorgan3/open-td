import Path from "../../terrain/path";
import { Agent } from "../entity";

export interface IEnemy extends Agent {
  hit(damage: number): void;
  getPath(): Path;
  attack(target: Agent, dt: number): void;
  hp: number;
  getFuturePosition(time: number): number;
  miss(damage: number): void;
}
