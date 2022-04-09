import Controller from "./controller";
import Base from "./entity/base";
import Surface from "./terrain/surface";
import Tile from "./terrain/tile";

class Manager {
  private controller: Controller;
  private base: Base;

  private static instance: Manager;

  constructor(
    private spawnPoints: Tile[],
    basePoint: Tile,
    private surface: Surface,
    controller?: Controller
  ) {
    Manager.instance = this;

    this.controller = controller ?? new Controller(surface);

    this.base = new Base(basePoint);
    surface.spawn(this.base);
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
