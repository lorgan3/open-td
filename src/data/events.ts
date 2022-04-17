export enum GameEvent {
  StatUpdate = 0,
}

export interface EventParamsMap {
  [GameEvent.StatUpdate]: [StatUpdate];
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
}
