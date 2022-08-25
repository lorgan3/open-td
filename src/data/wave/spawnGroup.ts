import { GameEvent } from "../events";
import Manager from "../manager";
import Path from "../terrain/path";
import Pathfinder from "../terrain/pathfinder";
import Tile from "../terrain/tile";

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

  initialize() {
    Manager.Instance?.addEventListener(
      GameEvent.SurfaceChange,
      this.updatePathCosts
    );
  }

  cleanup() {
    Manager.Instance.removeEventListener(
      GameEvent.SurfaceChange,
      this.updatePathCosts
    );
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
      (sum, path) => (path.getTile(0).isDiscovered() ? sum + 1 : sum),
      0
    );

    return exposedTiles / this.spawnPoints.length;
  }

  private updatePathCosts = () => {
    this.spawnPoints.forEach((path) => {
      path.recompute();
    });
  };

  rePath(pathfinder: Pathfinder) {
    const spawnPoints = this.spawnPoints.map((path) => path.getTile(0));
    const target = this.spawnPoints[0].getTile(
      this.spawnPoints[0].getLength() - 1
    );

    this.spawnPoints = pathfinder
      .getHivePath(spawnPoints, target)
      .filter((path): path is Path => !!path)
      .map((path) => {
        path.setSpeed(0.01);

        return path;
      });
  }

  static fromTiles(spawnPoints: Tile[], target: Tile, pathfinder: Pathfinder) {
    return new SpawnGroup(
      pathfinder
        .getHivePath(spawnPoints, target)
        .filter((path): path is Path => !!path)
        .map((path) => {
          path.setSpeed(0.01);

          return path;
        })
    );
  }
}

export default SpawnGroup;
