import Path from "../../terrain/path";
import { Agent } from "../entity";

export interface IEnemy extends Agent {
  hit(damage: number): void;
  getPath(): Path;
  hp: number;
}
