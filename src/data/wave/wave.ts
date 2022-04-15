import Manager from "../manager";
import Enemy from "../entity/enemy";
import SpawnGroup from "./SpawnGroup";

const SPAWN_INTERVAL = 400;

class Wave {
  private time = 0;
  private lastActivation = 0;

  constructor(private spawnGroups: SpawnGroup[], private intensity: number) {}

  isDone() {
    return this.intensity === 0;
  }

  getSpawnGroups() {
    return this.spawnGroups;
  }

  private getNextUnitToSpawn() {
    const spawnGroup =
      this.spawnGroups[this.intensity % this.spawnGroups.length];
    const path = spawnGroup.getNextSpawnPoint();
    this.intensity--;

    return new Enemy(path.getTile(), path.clone());
  }

  tick(dt: number) {
    this.time += dt;

    if (this.isDone()) {
      return;
    }

    if (this.time >= this.lastActivation + SPAWN_INTERVAL) {
      this.lastActivation = this.time;
      const enemy = this.getNextUnitToSpawn();
      Manager.Instance.getSurface().spawn(enemy);
    }
  }

  static fromLevel(level: number, spawnGroups: SpawnGroup[]) {
    const enemyAmount = 5 + 2 ** level;

    if (level < spawnGroups.length) {
      return new Wave([spawnGroups[level]], enemyAmount);
    }

    const value = level - spawnGroups.length + 1;
    const spawnGroupsThisWave: SpawnGroup[] = [];

    // Use binary to determine which spawnGroups become active, eg: value = 5 => 101b => spawnGroups[0] and [3] become active
    spawnGroups.forEach((spawnGroup, index) => {
      if (value & (1 << index)) {
        spawnGroupsThisWave.push(spawnGroup);
      }
    });

    return new Wave(spawnGroupsThisWave, enemyAmount);
  }
}

export default Wave;
