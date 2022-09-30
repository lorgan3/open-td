import Regular from "../entity/enemies/regular";
import Runner from "../entity/enemies/runner";
import SpawnGroup from "./SpawnGroup";
import { normalDistributionRandom, splitNumber } from "./util";

const MAX_SPAWN_DELAY = 4000;
const MIN_SPAWN_INTERVAL = 200;
const SPAWN_DISTRIBUTION = 500;
const MIN_BURST_INTERVAL = 500;
const BURST_DISTRIBUTION = 3000;
const MIN_BURST_SIZE = 3;
const BURST_SIZE_DISTRIBUTION = 12;
const SPAWN_GROUP_BONUS = 1.1; // More active spawn groups means harder waves
const SPAWN_GROUP_AGE_BONUS = 2 * Runner.cost; // Flat 2 extra runners for every wave a spawn group isn't cleared

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
    const totalEnergy = 2 ** level * Runner.cost;
    const energies = splitNumber(totalEnergy, spawnGroups.length);

    spawnGroups.forEach((spawnGroup, i) => {
      const energy =
        energies[i] * SPAWN_GROUP_BONUS +
        SPAWN_GROUP_AGE_BONUS * spawnGroup.getStrength();

      // The first wave + 50% will not be delayed
      const spawnDelay =
        i === 0 || Math.random() > 0.5
          ? 0
          : normalDistributionRandom() * MAX_SPAWN_DELAY;

      // 50% will be continuous, 50% will happen in bursts
      const burstSize =
        Math.random() > 0.5
          ? normalDistributionRandom() * BURST_SIZE_DISTRIBUTION +
            MIN_BURST_SIZE
          : Number.POSITIVE_INFINITY;

      spawnGroup.setParameters(
        Math.random() > 0.5 ? Runner : Regular,
        energy,
        normalDistributionRandom() * SPAWN_DISTRIBUTION + MIN_SPAWN_INTERVAL,
        spawnDelay,
        burstSize,
        normalDistributionRandom() * BURST_DISTRIBUTION + MIN_BURST_INTERVAL
      );
    });

    return new Wave(spawnGroups);
  }
}

export default Wave;
