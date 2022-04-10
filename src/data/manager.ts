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

  private paths: Path[];
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
      .filter((tiles): tiles is Tile[] => !!tiles)
      .map((tiles) => Path.fromTiles(tiles, 0.01, DEFAULT_COSTS));
  }

  tick(dt: number) {
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

  static get Instance() {
    return this.instance;
  }
}

export default Manager;
