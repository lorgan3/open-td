import { Agent } from "../../entity/entity";
import Tile from "../tile";

export interface Checkpoint {
  isCleared(tiles: Tile[], agent: Agent): boolean;
  process(tiles: Tile[], agent: Agent, dt: number): void;
  index: number;
}

export type CheckpointFn = (tiles: Tile[]) => Checkpoint[];

export const combineCheckpoints = (tiles: Tile[], ...fns: CheckpointFn[]) => {
  const total: Checkpoint[] = [];
  fns.forEach((fn) => total.push(...fn(tiles)));
  total.sort((a, b) => a.index - b.index);

  return total;
};
