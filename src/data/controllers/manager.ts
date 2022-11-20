import { MessageFn } from "../../renderers/api";
import BuildController from "./buildController";
import Controller from "./controller";
import { Difficulty } from "../difficulty";
import Base from "../entity/base";
import { IEnemy } from "../entity/enemies";
import { Agent } from "../entity/entity";
import { EventHandler, EventParamsMap, GameEvent } from "../events";
import MoneyController from "./moneyController";
import { Placeable } from "../placeables";
import PowerController from "./powerController";
import Surface from "../terrain/surface";
import Tile from "../terrain/tile";
import UnlocksController from "./unlocksController";
import VisibilityController from "./visibilityController";

import WaveController from "./waveController";

abstract class Manager {
  protected static instance: Manager;

  protected eventHandlers: Map<GameEvent, Set<EventHandler<any>>>;
  protected visibilityController: VisibilityController;
  protected powerController!: PowerController;
  protected moneyController!: MoneyController;
  protected buildController!: BuildController;
  protected unlocksController!: UnlocksController;
  protected waveController: WaveController;

  protected base: Base;

  constructor(
    protected difficulty: Difficulty,
    basePoint: Tile,
    protected surface: Surface,
    protected controller: Controller,
    protected messageFn: MessageFn
  ) {
    Manager.instance = this;
    this.eventHandlers = new Map();

    this.visibilityController = new VisibilityController(surface);
    this.base = new Base(basePoint);
    this.waveController = new WaveController(
      this.base,
      this.surface,
      this.visibilityController
    );
  }

  abstract tick(dt: number): void;

  abstract triggerStatUpdate(): void;

  abstract spawnEnemy(enemy: IEnemy): void;

  abstract despawnEnemy(enemy: IEnemy): void;

  getSurface() {
    return this.surface;
  }

  getController() {
    return this.controller;
  }

  getVisibilityController() {
    return this.visibilityController;
  }

  getPowerController() {
    return this.powerController;
  }

  getBuildController() {
    return this.buildController;
  }

  getMoneyController() {
    return this.moneyController;
  }

  getUnlocksController() {
    return this.unlocksController;
  }

  getWaveController() {
    return this.waveController;
  }

  getBase() {
    return this.base;
  }

  abstract getIsStarted(): boolean;

  abstract canBuy(placeable: Placeable, amount?: number): boolean;

  abstract start(): void;

  abstract showMessage: MessageFn;

  abstract consume(
    agent: Agent,
    speedMultiplier?: number,
    damageMultiplier?: number
  ): boolean;

  abstract consumeContinuous(
    agent: Agent,
    dt: number,
    damageMultiplie?: number
  ): boolean;

  getDifficulty() {
    return this.difficulty;
  }

  abstract getIsBaseDestroyed(): boolean;

  abstract getDamageMultiplier(): number;

  addEventListener<E extends keyof EventParamsMap>(
    event: E,
    fn: EventHandler<E>
  ) {
    if (this.eventHandlers.has(event)) {
      this.eventHandlers.get(event)!.add(fn);
    } else {
      this.eventHandlers.set(event, new Set([fn]));
    }

    return () => this.removeEventListener(event, fn);
  }

  addEventListeners(events: GameEvent[], fn: EventHandler<any>) {
    const removeEventListeners = events.map((event) =>
      this.addEventListener(event, fn)
    );

    return () => removeEventListeners.forEach((fn) => fn());
  }

  removeEventListener<E extends keyof EventParamsMap>(
    event: E,
    fn: EventHandler<E>
  ) {
    this.eventHandlers.get(event)?.delete(fn);
  }

  triggerEvent<E extends keyof EventParamsMap>(
    event: E,
    ...params: EventParamsMap[E]
  ) {
    this.eventHandlers.get(event)?.forEach((fn) => fn(...params));
  }

  static get Instance() {
    return this.instance;
  }
}

export default Manager;
