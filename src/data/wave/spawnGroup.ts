import Path from "../terrain/path";

export enum SpawnGroupType {
  Teleport = 0,
}

class SpawnGroup {
  private index = 0;
  constructor(
    private spawnPoints: Path[],
    private type = SpawnGroupType.Teleport
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
}

export default SpawnGroup;
