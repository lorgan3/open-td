import { Agent } from "../../entity/entity";
import Tile from "../tile";

export interface Checkpoint {
  isCleared(): boolean;
  process(agent: Agent, dt: number): void;
  index: number;
  tile: Tile;
}

export type CheckpointFn = (tiles: Tile[]) => Checkpoint[];
