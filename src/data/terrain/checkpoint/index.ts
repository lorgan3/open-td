import { Agent } from "../../entity/entity";
import Tile from "../tile";

export interface Checkpoint {
  isCleared(tiles: Tile[], agent: Agent): boolean;
  process(tiles: Tile[], agent: Agent, dt: number): void;
  index: number;
  readonly isBlocking: boolean;
}

export type CheckpointFn = (tiles: Tile[]) => Checkpoint[];

export const combineCheckpoints = (
  tiles: Tile[],
  ...fns: Array<CheckpointFn | undefined>
) => {
  const total: Checkpoint[] = [];
  fns.filter(Boolean).forEach((fn) => total.push(...fn!(tiles)));
  total.sort((a, b) => a.index - b.index);

  return total;
};

export const maybe = (odds: number, fn: CheckpointFn) => {
  if (odds > Math.random()) {
    return fn;
  }

  return undefined;
};
