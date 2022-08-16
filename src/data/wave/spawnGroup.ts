import { GameEvent } from "../events";
import Manager from "../manager";
import { combineCheckpoints } from "../terrain/checkpoint";
import { getStaticEntityCheckpoints } from "../terrain/checkpoint/staticEntity";
import { getWaterCheckpoints } from "../terrain/checkpoint/water";
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
    private type = SpawnGroupType.Teleport
  ) {
    Manager.Instance?.addEventListener(
      GameEvent.SurfaceChange,
      this.updatePathCosts
    );
  }

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

  cleanup() {
    Manager.Instance.removeEventListener(
      GameEvent.SurfaceChange,
      this.updatePathCosts
    );
  }

  private updatePathCosts = () => {
    this.spawnPoints.forEach((path) => {
      path.recompute();
      path.setCheckpoints(
        combineCheckpoints(
          path.getTiles(),
          getStaticEntityCheckpoints,
          getWaterCheckpoints
        )
      );
    });
  };

  static fromTiles(spawnPoints: Tile[], target: Tile, pathfinder: Pathfinder) {
    return new SpawnGroup(
      pathfinder
        .getHivePath(spawnPoints, target)
        .filter((path): path is Path => !!path)
        .map((path) => {
          path.setSpeed(0.01);
          path.setCheckpoints(
            combineCheckpoints(
              path.getTiles(),
              getStaticEntityCheckpoints,
              getWaterCheckpoints
            )
          );
          return path;
        })
    );
  }
}

export default SpawnGroup;
