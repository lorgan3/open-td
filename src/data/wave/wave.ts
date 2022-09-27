import Runner from "../entity/enemies/runner";
import SpawnGroup from "./SpawnGroup";

export const MAX_SPAWN_GROUPS = 3;

class Wave {
  constructor(private spawnGroups: SpawnGroup[]) {}

  isDone() {
    return !this.spawnGroups.find((spawnGroup) => spawnGroup.getEnergy() > 0);
  }

  getSpawnGroups() {
    return this.spawnGroups;
  }

  tick(dt: number) {
    this.spawnGroups.forEach((spawnGroup) => spawnGroup.tick(dt));
  }

  static fromSpawnGroups(level: number, spawnGroups: SpawnGroup[]) {
    const enemyAmount = ((5 + 2 ** level) * Runner.cost) / spawnGroups.length;

    spawnGroups.forEach((spawnGroup, i) => {
      spawnGroup.setParameters(
        Runner,
        enemyAmount,
        350,
        i * 2000,
        Number.POSITIVE_INFINITY,
        350
      );
    });

    return new Wave(spawnGroups);
  }
}

export default Wave;
