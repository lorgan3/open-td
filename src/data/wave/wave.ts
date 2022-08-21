import Manager from "../manager";
import Enemy from "../entity/enemies/enemy";
import SpawnGroup from "./SpawnGroup";
import { AgentCategory } from "../entity/entity";
import { combineCheckpoints, maybe } from "../terrain/checkpoint";
import { getStaticEntityCheckpoints } from "../terrain/checkpoint/staticEntity";
import { getWaterCheckpoints } from "../terrain/checkpoint/water";
import { getDirtCheckpoints } from "../terrain/checkpoint/dirt";

const MIN_SPAWN_INTERVAL = 50;
const SPAWN_INTERVAL = 350;

class Wave {
  private time = 0;
  private lastActivation = 0;
  private intensity: number;

  constructor(
    private spawnGroups: SpawnGroup[],
    private initialIntensity: number
  ) {
    this.intensity = initialIntensity;
    spawnGroups.forEach((spawnGroup) => spawnGroup.initialize());
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
    const path = spawnGroup.getNextSpawnPoint().clone();

    if (
      Math.random() * Math.min((spawnGroup.getStrength() - 1) / 5, 1.5) <
      0.75
    ) {
      this.intensity--;
    }

    path.setCheckpoints(
      combineCheckpoints(
        path.getTiles(),
        getStaticEntityCheckpoints,
        maybe(0.5, getDirtCheckpoints),
        maybe(0.1, getWaterCheckpoints)
      )
    );

    return new Enemy(path.getTile(), path);
  }

  tick(dt: number) {
    this.time += dt;

    if (this.intensity === 0) {
      return;
    }

    if (
      this.time >=
      this.lastActivation +
        MIN_SPAWN_INTERVAL +
        SPAWN_INTERVAL / this.spawnGroups.length
    ) {
      this.lastActivation = this.time;
      const enemy = this.getNextUnitToSpawn();
      Manager.Instance.spawnEnemy(enemy);
    }
  }

  public cleanup() {
    this.spawnGroups.forEach((spawnGroup) => spawnGroup.cleanup());
  }

  static fromStaticSpawnGroups(level: number, spawnGroups: SpawnGroup[]) {
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

  static fromDynamicSpawnGroups(level: number, spawnGroups: SpawnGroup[]) {
    const enemyAmount = 5 + 2 ** level;

    return new Wave(spawnGroups, enemyAmount);
  }
}

export default Wave;
