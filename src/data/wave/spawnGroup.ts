import { IEnemyStatics } from "../entity/enemies";
import Runner from "../entity/enemies/runner";
import Manager from "../controllers/manager";
import PathData from "../terrain/path/pathData";
import Pathfinder from "../terrain/path/pathfinder";
import Surface from "../terrain/surface";
import Tile from "../terrain/tile";
import { EntityType } from "../entity/constants";
import { DiscoveryStatus } from "../terrain/constants";

export interface SpawnGroupData {
  spawnPoints: Array<{ x: number; y: number }>;
}

class SpawnGroup {
  static size = 5;

  private index = 0;
  private pathData = new Map<EntityType, PathData>();
  private strength = 0;

  private unit: IEnemyStatics = Runner;
  private energy = 25;
  private spawnInterval = 200;
  private spawnDelay = 0;
  private burstSize = Number.POSITIVE_INFINITY;
  private burstInterval = 1000;

  private burst = 0;
  private timer = 0;

  private centerX = 0;
  private centerY = 0;

  constructor(
    private spawnPoints: Tile[],
    private target: Tile,
    private surface: Surface
  ) {
    spawnPoints.forEach((spawnPoint) => {
      this.centerX += spawnPoint.getX();
      this.centerY += spawnPoint.getY();
    });
    this.centerX /= spawnPoints.length;
    this.centerY /= spawnPoints.length;
  }

  setUnit(unit: IEnemyStatics) {
    this.unit = unit;
  }

  getUnitType() {
    return this.unit.type;
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
    this.timer = spawnInterval;
  }

  getEnergy() {
    return this.energy;
  }

  tick(dt: number) {
    if (this.energy === 0 || !this.isReady()) {
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
      this.burst++;

      const enemy = this.getNextUnit();
      Manager.Instance.spawnEnemy(enemy);
    }
  }

  getCenter(): [number, number] {
    return [this.centerX, this.centerY];
  }

  isReady() {
    return !!this.getPathData(this.unit.type).getPaths().length;
  }

  getSpawnPoints() {
    return this.getPathData(this.unit.type).getPaths();
  }

  getAsyncSpawnPoints() {
    return this.getPathData(this.unit.type).getAsyncPaths();
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
    let tiles = 0;
    let exposedTiles = 0;
    this.surface.forCircle(
      this.centerX,
      this.centerY,
      SpawnGroup.size,
      (tile) => {
        tiles++;
        if (tile.getDiscoveryStatus() !== DiscoveryStatus.Undiscovered) {
          exposedTiles++;
        }
      }
    );

    return exposedTiles / tiles;
  }

  rePath() {
    this.pathData.forEach((pathData) => pathData.update());
  }

  serialize(): SpawnGroupData {
    return {
      spawnPoints: this.spawnPoints.map((tile) => ({
        x: tile.getX(),
        y: tile.getY(),
      })),
    };
  }

  static deserialize(surface: Surface, target: Tile, data: SpawnGroupData) {
    return new SpawnGroup(
      data.spawnPoints.map(({ x, y }) => surface.getTile(x, y)!),
      target,
      surface
    );
  }

  private getPathData(type: EntityType) {
    if (!this.pathData.has(type)) {
      this.pathData.set(
        type,
        new PathData(
          new Pathfinder(
            this.surface,
            this.unit.pathMultipliers,
            this.unit.pathCosts,
            this.unit.scale
          ),
          this.spawnPoints,
          this.target
        )
      );
    }

    return this.pathData.get(type)!;
  }

  static fromTiles(spawnPoints: Tile[], target: Tile, surface: Surface) {
    return new SpawnGroup(spawnPoints, target, surface);
  }
}

export default SpawnGroup;
