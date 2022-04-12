import Controller from "./controller";
import Base from "./entity/base";
import Enemy from "./entity/enemy";
import Path from "./terrain/path";
import Pathfinder, { DEFAULT_COSTS } from "./terrain/pathfinder";
import Surface from "./terrain/surface";
import Tile from "./terrain/tile";

class Manager {
  private static instance: Manager;

  private controller: Controller;
  private pathfinder: Pathfinder;
  private base: Base;

  private paths: Path[] = [];
  private time = 0;
  private lastSpawnTime = 0;

  private wave = 0;
  private started = false;

  constructor(
    private spawnPoints: Tile[],
    basePoint: Tile,
    private surface: Surface,
    controller?: Controller
  ) {
    Manager.instance = this;

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

    if (!this.started) {
      return;
    }

    this.time += dt;

    if (this.time - this.lastSpawnTime > 1000) {
      this.lastSpawnTime = this.time;
      const path = this.paths[(Math.random() * this.paths.length) | 0];

      if (path) {
        const enemy = new Enemy(path.getTile(0), path.clone());
        this.surface.spawn(enemy);
      }
    }
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

  getIsStarted() {
    return this.started;
  }

  start() {
    if (this.started) {
      throw new Error("Wave already in progress!");
    }

    this.paths = this.pathfinder
      .getHivePath(this.spawnPoints, this.base.getTile())
      .filter((path): path is Path => !!path)
      .map((path) => {
        path.setSpeed(0.01);
        return path;
      });

    this.started = true;
    this.time = 0;
    this.wave++;
  }

  static get Instance() {
    return this.instance;
  }
}

export default Manager;
