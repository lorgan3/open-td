import Manager from "../manager";
import Enemy from "../entity/enemies/enemy";
import SpawnGroup from "./SpawnGroup";
import { AgentCategory } from "../entity/entity";

const SPAWN_INTERVAL = 400;

class Wave {
  private time = 0;
  private lastActivation = 0;
  private intensity: number;

  constructor(
    private spawnGroups: SpawnGroup[],
    private initialIntensity: number
  ) {
    this.intensity = initialIntensity;
  }

  isDone() {
    return (
      this.intensity === 0 &&
      Manager.Instance.getSurface().getEntitiesForCategory(AgentCategory.Enemy)
        .size === 0
    );
  }

  getSpawnGroups() {
    return this.spawnGroups;
  }

  getInitialIntensity() {
    return this.initialIntensity;
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

    if (this.intensity === 0) {
      return;
    }

    if (this.time >= this.lastActivation + SPAWN_INTERVAL) {
      this.lastActivation = this.time;
      const enemy = this.getNextUnitToSpawn();
      Manager.Instance.spawnEnemy(enemy);
    }
  }

  public cleanup() {
    this.spawnGroups.forEach((spawnGroup) => spawnGroup.cleanup());
  }

  static fromLevel(level: number, spawnGroups: SpawnGroup[]) {
    const enemyAmount = 5 + 2 ** level;

    if (level < spawnGroups.length) {
      return new Wave([spawnGroups[level]], enemyAmount);
    }

    let value = level - spawnGroups.length;
    if (!(value & ((1 << spawnGroups.length) - 1))) {
      value = (value % spawnGroups.length) + 1;
    }
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
