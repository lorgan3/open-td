import Tile from "./terrain/tile";

export enum GameEvent {
  StatUpdate = 0,
  SurfaceChange = 1,
}

export interface EventParamsMap {
  [GameEvent.StatUpdate]: [StatUpdate];
  [GameEvent.SurfaceChange]: [SurfaceChange];
}

export type EventHandler<E extends keyof EventParamsMap> = (
  ...args: EventParamsMap[E]
) => void;

export interface StatUpdate {
  level: number;
  money: number;
  integrity: number;
  totalEnemies: number;
  remainingEnemies: number;
  inProgress: boolean;
}

export interface SurfaceChange {
  affectedTiles: Tile[];
}
