import Controller from "./controller";
import Base from "./entity/base";
import Enemy from "./entity/enemy";
import Pathfinder from "./terrain/pathfinder";
import Surface from "./terrain/surface";
import Tile from "./terrain/tile";

class Manager {
  private static instance: Manager;

  private controller: Controller;
  private pathfinder: Pathfinder;
  private base: Base;

  private paths: Tile[][];
  private time = 0;
  private lastSpawnTime = 0;

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

    this.paths = this.pathfinder
      .getHivePath(spawnPoints, basePoint)
      .filter((path): path is Tile[] => !!path);
  }

  tick(dt: number) {
    this.time += dt;

    if (this.time - this.lastSpawnTime > 1000) {
      this.lastSpawnTime = this.time;
      const path = this.paths[(Math.random() * this.paths.length) | 0];

      if (path) {
        const enemy = new Enemy(path[0]);
        enemy.setPath(path);
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

  static get Instance() {
    return this.instance;
  }
}

export default Manager;
