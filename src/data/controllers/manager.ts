import { MessageFn } from "../../renderers/api";

import { Difficulty } from "../difficulty";
import Base from "../entity/base";
import { IEnemy } from "../entity/enemies";
import { Agent } from "../entity/entity";
import EventSystem from "../eventSystem";
import { Placeable } from "../placeables";
import Surface from "../terrain/surface";

abstract class Manager {
  protected static instance: Manager;

  protected level = 0;

  constructor(
    protected difficulty: Difficulty,
    protected base: Base,
    protected surface: Surface,
    protected messageFn: MessageFn
  ) {
    Manager.instance = this;
    new EventSystem();
  }

  abstract tick(dt: number): void;

  abstract triggerStatUpdate(): void;

  abstract spawnEnemy(enemy: IEnemy): void;

  abstract despawnEnemy(enemy: IEnemy): void;

  abstract getKilledEnemies(): number;

  getSurface() {
    return this.surface;
  }

  getBase() {
    return this.base;
  }

  getLevel() {
    return this.level;
  }

  abstract getIsStarted(): boolean;

  abstract canBuy(placeable: Placeable, amount?: number): boolean;

  abstract start(): void;

  abstract showMessage: MessageFn;

  update(newMessageFn: MessageFn) {
    this.messageFn = newMessageFn;
  }

  abstract consume(
    agent: Agent,
    speedMultiplier?: number,
    damageMultiplier?: number
  ): boolean;

  abstract consumeContinuous(
    agent: Agent,
    dt: number,
    damageMultiplier?: number
  ): boolean;

  getDifficulty() {
    return this.difficulty;
  }

  abstract getIsBaseDestroyed(): boolean;

  abstract getDamageMultiplier(): number;

  static get Instance() {
    return this.instance;
  }
}

export default Manager;
