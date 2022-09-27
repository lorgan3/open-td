import Manager from "../manager";
import Path from "../terrain/path/path";
import Pathfinder from "../terrain/path/pathfinder";
import Tile, { DiscoveryStatus } from "../terrain/tile";

export enum SpawnGroupType {
  Teleport = 0,
}

class SpawnGroup {
  private index = 0;

  constructor(
    private spawnPoints: Path[],
    private type = SpawnGroupType.Teleport,
    private strength = 1
  ) {}

  getSpawnPoints() {
    return this.spawnPoints;
  }

  getNextSpawnPoint() {
    const spawnPoint = this.spawnPoints[this.index];
    this.index = (this.index + 1) % this.spawnPoints.length;
    return spawnPoint;
  }

  getType() {
    return this.type;
  }

  grow() {
    this.strength++;
  }

  getStrength() {
    return this.strength;
  }

  // Returns a number [0, 1] based on how many of its tiles are already discovered
  isExposed() {
    const exposedTiles = this.spawnPoints.reduce(
      (sum, path) =>
        path.getTile(0).getDiscoveryStatus() !== DiscoveryStatus.Undiscovered
          ? sum + 1
          : sum,
      0
    );

    return exposedTiles / this.spawnPoints.length;
  }

  rePath(pathfinder: Pathfinder) {
    const spawnPoints = this.spawnPoints.map((path) => path.getTile(0));
    const oldTarget = this.spawnPoints[0].getTile(
      this.spawnPoints[0].getLength() - 1
    );
    const target = Manager.Instance.getSurface().getTile(
      oldTarget.getX(),
      oldTarget.getY()
    )!;

    this.spawnPoints = pathfinder
      .getHivePath(spawnPoints, target)
      .filter((path): path is Path => !!path);
  }

  static fromTiles(spawnPoints: Tile[], target: Tile, pathfinder: Pathfinder) {
    return new SpawnGroup(
      pathfinder
        .getHivePath(spawnPoints, target)
        .filter((path): path is Path => !!path)
    );
  }
}

export default SpawnGroup;
