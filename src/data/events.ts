import { StaticAgent } from "./entity/staticEntity";
import Tile from "./terrain/tile";

export enum GameEvent {
  StatUpdate = 0,
  SurfaceChange = 1,
  BlackOut = 2,
  OpenBuildMenu = 3,
  CloseBuildMenu = 4,
  ToggleShowCoverage = 5,
  StartWave = 6,
  EndWave = 7,
}

export interface EventParamsMap {
  [GameEvent.StatUpdate]: [StatUpdate];
  [GameEvent.SurfaceChange]: [SurfaceChange];
  [GameEvent.BlackOut]: [];
  [GameEvent.OpenBuildMenu]: [];
  [GameEvent.CloseBuildMenu]: [];
  [GameEvent.ToggleShowCoverage]: [];
  [GameEvent.StartWave]: [];
  [GameEvent.EndWave]: [];
}

export type EventHandler<E extends keyof EventParamsMap> = (
  ...args: EventParamsMap[E]
) => void;

export interface StatUpdate {
  level: number;
  money: number;
  moneyMultiplier: number;
  integrity: number;
  regeneration: number;
  power: number;
  production: number;
  consumption: number;
  remainingEnemies: number;
  inProgress: boolean;
}

export interface SurfaceChange {
  affectedTiles: Set<Tile>;
  addedStaticAgents: Set<StaticAgent>;
  removedStaticAgents: Set<StaticAgent>;
}
