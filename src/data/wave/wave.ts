import { Difficulty } from "../difficulty";
import { IEnemyStatics } from "../entity/enemies";
import Flier from "../entity/enemies/flier";
import Regular from "../entity/enemies/regular";
import Runner from "../entity/enemies/runner";
import Tank from "../entity/enemies/tank";
import Manager from "../controllers/manager";
import SpawnGroup from "./spawnGroup";
import { normalDistributionRandom, splitNumber } from "./util";
import Behemoth from "../entity/enemies/behemoth";
import Bore from "../entity/enemies/bore";
import { EntityType } from "../entity/constants";

const MAX_SPAWN_DELAY = 4000;
const MIN_SPAWN_INTERVAL = 150;
const SPAWN_DISTRIBUTION = 550;
const MIN_BURST_INTERVAL = 500;
const BURST_DISTRIBUTION = 3000;
const MIN_BURST_SIZE = 3;
const BURST_SIZE_DISTRIBUTION = 12;
const SPAWN_GROUP_BONUS = 1.1; // More active spawn groups means harder waves
const SPAWN_GROUP_AGE_BONUSES: Record<Difficulty, number> = {
  [Difficulty.Practice]: 0,
  [Difficulty.Easy]: 0,
  [Difficulty.Normal]: 1.5 * Runner.cost,
  [Difficulty.Hard]: 3 * Runner.cost,
};

const UNIT_SPAWN_SPEED_MULTIPLIERS: Partial<Record<EntityType, number>> = {
  [EntityType.Runner]: 0.8,
  [EntityType.Slime]: 1,
  [EntityType.Flier]: 1,
  [EntityType.Tank]: 1.2,
  [EntityType.Behemoth]: 1.6,
  [EntityType.Bore]: 10,
};

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
    const totalEnergy = (1 + level ** 2) * Runner.cost;
    const energies = splitNumber(totalEnergy, spawnGroups.length);
    const spawnGroupAgeBonus =
      SPAWN_GROUP_AGE_BONUSES[Manager.Instance.getDifficulty()];

    spawnGroups.forEach((spawnGroup, i) => {
      const energy =
        energies[i] * SPAWN_GROUP_BONUS +
        spawnGroupAgeBonus * spawnGroup.getStrength();

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
        energy,
        ((normalDistributionRandom() * SPAWN_DISTRIBUTION) /
          Math.max(1, level / 3) +
          MIN_SPAWN_INTERVAL) *
          UNIT_SPAWN_SPEED_MULTIPLIERS[spawnGroup.getUnitType()]!,
        spawnDelay,
        burstSize,
        normalDistributionRandom() * BURST_DISTRIBUTION + MIN_BURST_INTERVAL
      );
    });

    return new Wave(spawnGroups);
  }

  static getUnitForLevel(level: number): IEnemyStatics {
    if (level === 0) {
      return Runner;
    }

    if (level !== 1 && (level + 1) % 10 === 0) {
      return Bore;
    }

    const random = Math.random();
    if (random < 0.2 - level / 200) {
      return Runner;
    }

    if (level >= 3 && random < 0.3) {
      return Flier;
    }

    if (level >= 8 && random < 0.6) {
      return Behemoth;
    }

    return Math.random() > Math.min(0.7, 0.1 + level / 30) ? Regular : Tank;
  }
}

export default Wave;
