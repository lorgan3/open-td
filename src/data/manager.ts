import Controller from "./controller";
import Base from "./entity/base";
import { AgentCategory } from "./entity/entity";
import { EventHandler, EventParamsMap, GameEvent } from "./events";
import { Placeable } from "./placeables";
import Pathfinder from "./terrain/pathfinder";
import Surface from "./terrain/surface";
import Tile from "./terrain/tile";
import SpawnGroup from "./wave/SpawnGroup";
import Wave from "./wave/wave";

class Manager {
  private static instance: Manager;

  private eventHandlers: Map<GameEvent, Set<EventHandler<any>>>;
  private controller: Controller;
  private pathfinder: Pathfinder;
  private base: Base;

  private level = 0;
  private wave: Wave | undefined;
  private integrity = 10;
  private money = 100;

  constructor(
    private spawnGroups: Tile[][],
    basePoint: Tile,
    private surface: Surface,
    controller?: Controller
  ) {
    Manager.instance = this;

    this.eventHandlers = new Map();
    this.controller = controller ?? new Controller(surface);
    this.pathfinder = new Pathfinder(surface);

    this.base = new Base(basePoint);
    surface.spawn(this.base);
  }

  tick(dt: number) {
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

    const remainingEnemies = this.getSurface().getEntitiesForCategory(
      AgentCategory.Enemy
    ).size;
    this.triggerEvent(GameEvent.StatUpdate, {
      integrity: this.integrity,
      level: this.level,
      money: this.money,
      remainingEnemies,
      totalEnemies: this.wave.getInitialIntensity(),
      inProgress: remainingEnemies !== 0,
    });
  }

  getSurface() {
    return this.surface;
  }

  getController() {
    return this.controller;
  }

  getBase() {
    return this.base;
  }

  getWave() {
    return this.wave;
  }

  getIntegrity() {
    return this.integrity;
  }

  getMoney() {
    return this.money;
  }

  getIsStarted() {
    return !!this.wave && !this.wave.isDone();
  }

  buy(placeable: Placeable, amount = 1) {
    const cost = placeable.cost * amount;
    if (cost > this.money) {
      return false;
    }

    this.money -= cost;
    console.log(cost, this.money);
    return true;
  }

  start() {
    if (this.getIsStarted()) {
      throw new Error("Wave already in progress!");
    }

    this.wave = Wave.fromLevel(
      this.level,
      this.spawnGroups.map((tiles) =>
        SpawnGroup.fromTiles(tiles, this.base.getTile(), this.pathfinder)
      )
    );
    this.level++;
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
