import { Agent } from "./entity/entity";
import Tile from "./terrain/tile";

export enum GameEvent {
  StatUpdate = 0,
  SurfaceChange = 1,
  BlackOut = 2,
  OpenBuildMenu = 3,
}

export interface EventParamsMap {
  [GameEvent.StatUpdate]: [StatUpdate];
  [GameEvent.SurfaceChange]: [SurfaceChange];
  [GameEvent.BlackOut]: [BlackOut];
  [GameEvent.OpenBuildMenu]: [];
}

export type EventHandler<E extends keyof EventParamsMap> = (
  ...args: EventParamsMap[E]
) => void;

export interface StatUpdate {
  level: number;
  money: number;
  integrity: number;
  regeneration: number;
  power: number;
  production: number;
  consumption: number;
  totalEnemies: number;
  remainingEnemies: number;
  inProgress: boolean;
}

export interface SurfaceChange {
  affectedTiles: Tile[];
}

export interface BlackOut {
  affectedConsumers: Agent[];
}
