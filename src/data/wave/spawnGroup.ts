import { IEnemyStatics } from "../entity/enemies";
import Runner from "../entity/enemies/runner";
import { EntityType } from "../entity/entity";
import Manager from "../manager";
import PathData from "../terrain/path/pathData";
import Pathfinder from "../terrain/path/pathfinder";
import Surface from "../terrain/surface";
import Tile, { DiscoveryStatus } from "../terrain/tile";

class SpawnGroup {
  private index = 0;
  private pathData = new Map<EntityType, PathData>();
  private strength = 1;

  private unit: IEnemyStatics = Runner;
  private energy = 25;
  private spawnInterval = 200;
  private spawnDelay = 0;
  private burstSize = Number.POSITIVE_INFINITY;
  private burstInterval = 1000;

  private burst = 0;
  private timer = 0;

  constructor(
    private spawnPoints: Tile[],
    private target: Tile,
    private surface: Surface
  ) {}

  setUnit(unit: IEnemyStatics) {
    this.unit = unit;
  }

  setParameters(
    energy: number,
    spawnInterval: number,
    spawnDelay: number,
    burstSize: number,
    burstInterval: number
  ) {
    this.energy = energy;
    this.spawnInterval = spawnInterval;
    this.spawnDelay = spawnDelay;
    this.burstSize = burstSize;
    this.burstInterval = burstInterval;

    this.burst = 0;
    this.timer = 0;
  }

  getEnergy() {
    return this.energy;
  }

  tick(dt: number) {
    if (this.energy === 0) {
      return;
    }

    this.timer += dt;

    if (this.spawnDelay > 0) {
      if (this.timer > this.spawnDelay) {
        this.timer -= this.spawnDelay;
        this.spawnDelay = 0;
      } else {
        return;
      }
    }

    if (this.burst >= this.burstSize) {
      if (this.timer >= this.burstInterval) {
        this.timer -= this.burstInterval;
        this.burst = 0;
      } else {
        return;
      }
    }

    if (this.timer >= this.spawnInterval) {
      this.timer -= this.spawnInterval;
      this.energy = Math.max(0, this.energy - this.unit.cost);

      const enemy = this.getNextUnit();
      Manager.Instance.spawnEnemy(enemy);
    }
  }

  private getPathData(type: EntityType) {
    if (!this.pathData.has(type)) {
      this.pathData.set(
        type,
        new PathData(
          new Pathfinder(
            this.surface,
            this.unit.pathMultipliers,
            this.unit.pathCosts
          ),
          this.spawnPoints,
          this.target
        )
      );
    }

    return this.pathData.get(type)!;
  }

  getSpawnPoints() {
    return this.getPathData(this.unit.type).getPaths();
  }

  getNextSpawnPoint() {
    const spawnPoints = this.getSpawnPoints();
    const spawnPoint = spawnPoints[this.index];
    this.index = (this.index + 1) % spawnPoints.length;
    return spawnPoint;
  }

  getNextUnit() {
    const path = this.getNextSpawnPoint().clone();

    const unit = new this.unit(path.getTile(), path);
    unit.initializePath();

    return unit;
  }

  grow() {
    this.strength++;
  }

  getStrength() {
    return this.strength;
  }

  // Returns a number [0, 1] based on how many of its tiles are already discovered
  isExposed() {
    const spawnPoints = this.getSpawnPoints();
    const exposedTiles = spawnPoints.reduce(
      (sum, path) =>
        path.getTile(0).getDiscoveryStatus() !== DiscoveryStatus.Undiscovered
          ? sum + 1
          : sum,
      0
    );

    return exposedTiles / spawnPoints.length;
  }

  rePath() {
    this.pathData.forEach((pathData) => pathData.update());
  }

  static fromTiles(spawnPoints: Tile[], target: Tile, surface: Surface) {
    return new SpawnGroup(spawnPoints, target, surface);
  }
}

export default SpawnGroup;
