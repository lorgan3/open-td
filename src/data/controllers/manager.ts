import { MessageFn } from "../../renderers/api";
import BuildController from "./buildController";
import Controller from "./controller";
import { Difficulty } from "../difficulty";
import Base from "../entity/base";
import { IEnemy } from "../entity/enemies";
import { Agent, AgentCategory, EntityType } from "../entity/entity";
import { EventHandler, EventParamsMap, GameEvent, Unlock } from "../events";
import MoneyController, { TOWER_PRICES } from "./moneyController";
import { Placeable, WAVE_OVER_MULTIPLIER } from "../placeables";
import PowerController, {
  DAMAGE_BEACON_CONSUMPTION,
  POWER_CONSUMPTIONS,
  SPEED_BEACON_CONSUMPTION,
} from "./powerController";
import Surface from "../terrain/surface";
import Tile from "../terrain/tile";
import UnlocksController from "./unlocksController";
import SpawnAlert from "../util/spawnAlert";
import VisibilityController from "./visibilityController";

import WaveController from "./waveController";

class Manager {
  private static instance: Manager;

  private eventHandlers: Map<GameEvent, Set<EventHandler<any>>>;
  private visibilityController: VisibilityController;
  private powerController: PowerController;
  private moneyController: MoneyController;
  private buildController: BuildController;
  private unlocksController: UnlocksController;
  private waveController: WaveController;

  private base: Base;

  constructor(
    private difficulty: Difficulty,
    basePoint: Tile,
    private surface: Surface,
    private controller: Controller,
    private messageFn: MessageFn
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

    this.powerController = new PowerController();
    this.moneyController = new MoneyController(150, () =>
      Math.max(
        0.5,
        this.base.getMoneyFactor() - this.waveController.getLevel() / 120
      )
    );
    this.buildController = new BuildController(surface);
    this.unlocksController = new UnlocksController();

    this.surface.getEntityTiles(this.base).map((tile) => {
      if (tile.hasStaticEntity()) {
        this.surface.despawnStatic(tile.getStaticEntity().getAgent());
      }
    });

    surface.spawnStatic(this.base);

    this.addEventListener(GameEvent.Unlock, this.onUnlock);

    console.log(this);
  }

  tick(dt: number) {
    this.surface.processChangedTiles();

    if (this.base.isDestroyed()) {
      return;
    }

    const entities = this.surface.getEntities();
    for (let entity of entities) {
      if (entity.getAgent().tick) {
        entity.getAgent().tick!(dt);
      }
    }

    const staticEntities = this.surface.getStaticEntities();
    for (let entity of staticEntities) {
      if (entity.getAgent().tick) {
        entity.getAgent().tick!(dt);
      }
    }

    this.waveController.tick(dt);
  }

  triggerStatUpdate() {
    const remainingEnemies = this.getSurface().getEntitiesForCategory(
      AgentCategory.Enemy
    ).size;

    this.triggerEvent(GameEvent.StatUpdate, {
      integrity: this.base.getHp(),
      regeneration: this.base.getRegenerationFactor(),
      level: this.waveController.getLevel(),
      money: this.moneyController.getMoney(),
      moneyMultiplier: this.moneyController.getMultiplier(),
      production: this.powerController.getProduction(),
      consumption: this.powerController.getConsumption(),
      power: this.powerController.getPower(),
      remainingEnemies,
      inProgress: this.getIsStarted(),
    });
  }

  spawnEnemy(enemy: IEnemy) {
    this.surface.spawn(enemy);
    this.triggerStatUpdate();
  }

  despawnEnemy(enemy: IEnemy) {
    if (this.surface.despawn(enemy)) {
      this.moneyController.registerEnemyKill(enemy);

      if (this.waveController.processWave()) {
        this.end();
      } else {
        this.triggerStatUpdate();
      }
    }
  }

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

  getIsStarted() {
    return this.waveController.isWaveInProgress();
  }

  canBuy(placeable: Placeable, amount = 1) {
    const cost = (TOWER_PRICES[placeable.entityType] ?? 0) * amount;
    if (cost > this.moneyController.getMoney()) {
      this.showMessage(`You do not have enough money. This costs 🪙 ${cost}`);
      return false;
    }

    return true;
  }

  start() {
    if (this.getIsStarted()) {
      throw new Error("Wave already in progress!");
    }

    this.triggerEvent(GameEvent.StartWave);

    this.powerController.processPower();
    this.moneyController.clearRecents();
    this.visibilityController.commit();
    this.waveController.startNewWave();

    this.triggerStatUpdate();
    Manager.Instance.getSurface().forceRerender();
  }

  showMessage: MessageFn = (...args) => {
    return this.messageFn(...args);
  };

  consume(agent: Agent, speedMultiplier = 1, damageMultiplier = 1) {
    return this.powerController.consume(
      (POWER_CONSUMPTIONS[agent.getType()] ?? 0) +
        (speedMultiplier - 1) * SPEED_BEACON_CONSUMPTION +
        (damageMultiplier - 1) * DAMAGE_BEACON_CONSUMPTION
    );
  }

  consumeContinuous(agent: Agent, dt: number, damageMultiplier = 1) {
    return this.powerController.consume(
      (POWER_CONSUMPTIONS[agent.getType()] ?? 0) * dt +
        ((damageMultiplier - 1) * DAMAGE_BEACON_CONSUMPTION * dt) / 16
    );
  }

  getDifficulty() {
    return this.difficulty;
  }

  getIsBaseDestroyed() {
    return this.base.isDestroyed();
  }

  private end() {
    this.buildController.commit();
    this.base.regenerate();
    this.unlocksController.addPoint();
    this.visibilityController.updateBaseRange();

    this.triggerStatUpdate();
    this.triggerEvent(GameEvent.EndWave);

    // Spawn group paths might have changed
    Manager.Instance.getSurface().forceRerender();
  }

  getDamageMultiplier() {
    let multiplier = 1;
    switch (this.difficulty) {
      case Difficulty.Hard:
        multiplier += 0.2;
      case Difficulty.Normal:
        multiplier += 0.2;
    }

    return multiplier;
  }

  private onUnlock = ({ placeable }: Unlock) => {
    const inProgress = this.getIsStarted();

    if (placeable.entityType === EntityType.EmergencyRecharge) {
      this.powerController.processPower(inProgress ? 1 : WAVE_OVER_MULTIPLIER);
    }

    if (placeable.entityType === EntityType.EmergencyRepair) {
      this.base.regenerate(inProgress ? 1 : WAVE_OVER_MULTIPLIER);
    }
  };

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
