import { IEnemyStatics } from "../entity/enemies";
import Runner from "../entity/enemies/runner";
import { EntityType } from "../entity/entity";
import PathData from "../terrain/path/pathData";
import Pathfinder from "../terrain/path/pathfinder";
import Surface from "../terrain/surface";
import Tile, { DiscoveryStatus } from "../terrain/tile";

class SpawnGroup {
  private index = 0;
  private pathData = new Map<EntityType, PathData>();
  private strength = 1;

  constructor(
    private spawnPoints: Tile[],
    private target: Tile,
    private surface: Surface
  ) {}

  private getPathData(type: EntityType) {
    if (!this.pathData.has(type)) {
      this.pathData.set(
        type,
        new PathData(
          new Pathfinder(this.surface),
          this.spawnPoints,
          this.target
        )
      );
    }

    return this.pathData.get(type)!;
  }

  private getNextUnitClass(): IEnemyStatics {
    return Runner;
  }

  getSpawnPoints() {
    const clazz = this.getNextUnitClass();
    return this.getPathData(clazz.type).getPaths();
  }

  getNextSpawnPoint() {
    const spawnPoints = this.getSpawnPoints();
    const spawnPoint = spawnPoints[this.index];
    this.index = (this.index + 1) % spawnPoints.length;
    return spawnPoint;
  }

  getNextUnit() {
    const clazz = this.getNextUnitClass();
    const path = this.getNextSpawnPoint().clone();

    const unit = new clazz(path.getTile(), path);
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
