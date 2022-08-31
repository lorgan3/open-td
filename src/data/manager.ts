import { MessageFn } from "../renderers/api";
import BuildController from "./buildController";
import Controller from "./controller";
import Base from "./entity/base";
import Blueprint from "./entity/Blueprint";
import Enemy from "./entity/enemies/enemy";
import { Agent, AgentCategory } from "./entity/entity";
import { EventHandler, EventParamsMap, GameEvent } from "./events";
import MoneyController, { TOWER_PRICES } from "./moneyController";
import { Placeable } from "./placeables";
import PowerController from "./powerController";
import Pathfinder from "./terrain/pathfinder";
import Surface from "./terrain/surface";
import Tile, {
  FREE_TILES,
  FREE_TILES_INCLUDING_WATER,
  TileType,
} from "./terrain/tile";
import VisibilityController from "./visibilityController";
import SpawnGroup from "./wave/SpawnGroup";
import Wave, { MAX_SPAWN_GROUPS } from "./wave/wave";

class Manager {
  private static instance: Manager;

  private eventHandlers: Map<GameEvent, Set<EventHandler<any>>>;
  private visibilityController: VisibilityController;
  private powerController: PowerController;
  private moneyController: MoneyController;
  private buildController: BuildController;
  private pathfinder: Pathfinder;
  private base: Base;
  private spawnGroups: SpawnGroup[] = [];

  private level = 0;
  private wave: Wave | undefined;

  constructor(
    basePoint: Tile,
    private surface: Surface,
    private controller: Controller,
    private messageFn: MessageFn
  ) {
    Manager.instance = this;

    this.eventHandlers = new Map();
    this.visibilityController = new VisibilityController(surface);
    this.powerController = new PowerController();
    this.moneyController = new MoneyController(1000);
    this.buildController = new BuildController(surface);
    this.pathfinder = new Pathfinder(surface);

    if (basePoint.hasStaticEntity()) {
      basePoint.clearStaticEntity();
    }

    this.base = new Base(basePoint);
    surface.spawnStatic(this.base);

    console.log(this);
  }

  tick(dt: number) {
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

    if (!this.wave) {
      return;
    }

    this.wave.tick(dt);
  }

  triggerStatUpdate() {
    const remainingEnemies = this.getSurface().getEntitiesForCategory(
      AgentCategory.Enemy
    ).size;

    this.triggerEvent(GameEvent.StatUpdate, {
      integrity: this.getIntegrity(),
      level: this.level,
      money: this.moneyController.getMoney(),
      production: this.powerController.getLastProduction(),
      consumption: this.powerController.getLastConsumption(),
      power: this.powerController.getPower(),
      remainingEnemies,
      totalEnemies: this.wave ? this.wave.getInitialIntensity() : 0,
      inProgress: remainingEnemies !== 0,
    });
  }

  spawnEnemy(enemy: Enemy) {
    this.surface.spawn(enemy);
    this.triggerStatUpdate();
  }

  despawnEnemy(enemy: Enemy) {
    if (this.surface.despawn(enemy)) {
      this.moneyController.registerEnemyKill(enemy);

      const remainingEnemies = this.getSurface().getEntitiesForCategory(
        AgentCategory.Enemy
      ).size;

      if (remainingEnemies === 0) {
        this.end();
      }

      this.triggerStatUpdate();
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

  getBase() {
    return this.base;
  }

  getWave() {
    return this.wave;
  }

  getIntegrity() {
    return this.base.getHp();
  }

  getMoney() {
    return this.moneyController.getMoney();
  }

  getIsStarted() {
    return !!this.wave && !this.wave.isDone();
  }

  buy(placeable: Placeable, amount = 1) {
    const cost = (TOWER_PRICES[placeable.entityType] ?? 0) * amount;
    if (cost > this.moneyController.getMoney()) {
      return false;
    }

    this.moneyController.removeMoney(cost);
    this.triggerStatUpdate();

    return true;
  }

  sell(agent: Agent) {
    if (agent instanceof Blueprint) {
      this.addMoney(TOWER_PRICES[agent.getPlaceable().entityType] ?? 0);
    } else {
      this.addMoney(TOWER_PRICES[agent.getType()] ?? 0);
    }
  }

  addMoney(amount: number) {
    this.moneyController.addMoney(amount);
    this.triggerStatUpdate();
  }

  start() {
    if (this.getIsStarted()) {
      throw new Error("Wave already in progress!");
    }

    if (this.wave) {
      this.wave.cleanup();
    }

    for (let i = this.spawnGroups.length - 1; i >= 0; i--) {
      const spawnGroup = this.spawnGroups[i];

      if (spawnGroup.isExposed()) {
        // Clean up exposed spawn locations
        this.spawnGroups.splice(i, 1);
      } else {
        // ...and make the others stronger
        spawnGroup.grow();
        spawnGroup.rePath(this.pathfinder);
      }
    }

    if (this.spawnGroups.length < MAX_SPAWN_GROUPS) {
      // Add a new spawn location every wave
      let direction = Math.random() * Math.PI * 2;
      let spawned = false;
      let backOff = 3;
      for (let i = 0; i < 20; i++) {
        this.surface.forRay(
          this.base.getTile().getX(),
          this.base.getTile().getY(),
          direction,
          (tile) => {
            if (tile.isDiscovered()) {
              backOff = 3;
              return true;
            }

            backOff--;

            if (backOff > 0 || !FREE_TILES.has(tile.getType())) {
              return true;
            }

            this.spawnGroups.push(
              SpawnGroup.fromTiles(
                [tile, tile, tile, tile],
                this.base.getTile(),
                this.pathfinder
              )
            );
            const tilesToUpdate: Tile[] = [];
            this.surface.forCircle(tile.getX(), tile.getY(), 5, (tile) => {
              if (FREE_TILES.has(tile.getType())) {
                tilesToUpdate.push(
                  new Tile(tile.getX(), tile.getY(), TileType.Spore)
                );
              }
            });
            this.surface.setTiles(tilesToUpdate);
            spawned = true;
            return false;
          }
        );

        if (!spawned) {
          direction += direction + Math.PI / 10;
        } else {
          break;
        }
      }
    }

    this.wave = Wave.fromDynamicSpawnGroups(this.level, this.spawnGroups);

    this.level++;
    this.triggerStatUpdate();
  }

  showMessage: MessageFn = (...args) => {
    return this.messageFn(...args);
  };

  private end() {
    this.powerController.processPower();
    this.buildController.commit();
  }

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
