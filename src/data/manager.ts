import Controller from "./controller";
import Base from "./entity/base";
import Enemy from "./entity/enemies/enemy";
import { AgentCategory } from "./entity/entity";
import { EventHandler, EventParamsMap, GameEvent } from "./events";
import { Placeable } from "./placeables";
import Pathfinder from "./terrain/pathfinder";
import Surface from "./terrain/surface";
import Tile, {
  FREE_TILES,
  FREE_TILES_INCLUDING_WATER,
  TileType,
} from "./terrain/tile";
import VisibilityController from "./visibilityController";
import SpawnGroup from "./wave/SpawnGroup";
import Wave from "./wave/wave";

class Manager {
  private static instance: Manager;

  private eventHandlers: Map<GameEvent, Set<EventHandler<any>>>;
  private controller: Controller;
  private visibilityController: VisibilityController;
  private pathfinder: Pathfinder;
  private base: Base;
  private spawnGroups: SpawnGroup[] = [];

  private level = 0;
  private wave: Wave | undefined;
  private money = 1000;

  constructor(
    basePoint: Tile,
    private surface: Surface,
    controller?: Controller
  ) {
    Manager.instance = this;

    this.eventHandlers = new Map();
    this.controller = controller ?? new Controller(surface);
    this.visibilityController = new VisibilityController(surface);
    this.pathfinder = new Pathfinder(surface);

    if (basePoint.hasStaticEntity()) {
      basePoint.clearStaticEntity();
    }

    this.base = new Base(basePoint);
    surface.spawnStatic(this.base);

    const tilesToUpdate: Tile[] = [];
    this.surface.forCircle(basePoint.getX(), basePoint.getY(), 5, (tile) => {
      if (
        tile !== basePoint &&
        FREE_TILES_INCLUDING_WATER.has(tile.getType())
      ) {
        tilesToUpdate.push(new Tile(tile.getX(), tile.getY(), TileType.Stone));
      }
    });
    this.surface.setTiles(tilesToUpdate);

    console.log(this);
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
  }

  triggerStatUpdate() {
    const remainingEnemies = this.getSurface().getEntitiesForCategory(
      AgentCategory.Enemy
    ).size;

    this.triggerEvent(GameEvent.StatUpdate, {
      integrity: this.getIntegrity(),
      level: this.level,
      money: this.money,
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
    this.surface.despawn(enemy);
    this.triggerStatUpdate();
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
    this.triggerStatUpdate();
    return true;
  }

  addMoney(amount: number) {
    this.money += amount;
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
      }
    }

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

    this.wave = Wave.fromDynamicSpawnGroups(this.level, this.spawnGroups);

    this.level++;
    this.triggerStatUpdate();
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
