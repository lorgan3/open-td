import Controller from "./controller";
import Base from "./entity/base";
import Surface from "./terrain/surface";
import Tile from "./terrain/tile";
import SpawnGroup from "./wave/SpawnGroup";
import Wave from "./wave/wave";

class Manager {
  private static instance: Manager;

  private controller: Controller;
  private base: Base;

  private level = 0;
  private wave: Wave | undefined;

  constructor(
    private spawnGroups: SpawnGroup[],
    basePoint: Tile,
    private surface: Surface,
    controller?: Controller
  ) {
    Manager.instance = this;

    this.controller = controller ?? new Controller(surface);

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
    return !!this.wave && !this.wave.isDone();
  }

  start() {
    if (this.getIsStarted()) {
      throw new Error("Wave already in progress!");
    }

    this.wave = Wave.fromLevel(this.level, this.spawnGroups);
    this.level++;
  }

  static get Instance() {
    return this.instance;
  }
}

export default Manager;
