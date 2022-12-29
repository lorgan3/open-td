import { StaticAgent } from "./entity/staticEntity";
import { Placeable } from "./placeables";
import Tile from "./terrain/tile";

export enum GameEvent {
  StatUpdate,
  SurfaceChange,
  BlackOut,
  OpenBuildMenu,
  CloseBuildMenu,
  SelectPlaceable,
  ToggleShowCoverage,
  StartWave,
  EndWave,
  Unlock,
  Discover,
  Spawn,
  Buy,
  Sell,
  HitBase,
  Lose,
}

export interface EventParamsMap {
  [GameEvent.StatUpdate]: [StatUpdate];
  [GameEvent.SurfaceChange]: [SurfaceChange];
  [GameEvent.BlackOut]: [];
  [GameEvent.OpenBuildMenu]: [];
  [GameEvent.CloseBuildMenu]: [];
  [GameEvent.SelectPlaceable]: [SelectPlaceable];
  [GameEvent.ToggleShowCoverage]: [];
  [GameEvent.StartWave]: [];
  [GameEvent.EndWave]: [];
  [GameEvent.Unlock]: [Unlock];
  [GameEvent.Discover]: [Discover];
  [GameEvent.Spawn]: [];
  [GameEvent.Buy]: [];
  [GameEvent.Sell]: [];
  [GameEvent.HitBase]: [];
  [GameEvent.Lose]: [];
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

export interface SelectPlaceable {
  placeable: Placeable;
}

export interface Unlock {
  placeable: Placeable;
}

export interface Discover {
  x: number;
  y: number;
}
