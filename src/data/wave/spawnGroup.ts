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

  getSpawnPoints() {
    return this.getPathData(EntityType.Runner).getPaths();
  }

  getNextSpawnPoint() {
    const spawnPoints = this.getSpawnPoints();
    const spawnPoint = spawnPoints[this.index];
    this.index = (this.index + 1) % spawnPoints.length;
    return spawnPoint;
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
