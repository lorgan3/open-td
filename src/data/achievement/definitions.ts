import Manager from "../controllers/manager";
import VisibilityController from "../controllers/visibilityController";
import { Difficulty } from "../difficulty";
import { GameEvent } from "../events";
import { TileType } from "../terrain/constants";
import { AchievementDefinition } from "./achievement";

export const achievements: AchievementDefinition[] = [
  {
    description: "Reach a certain wave.",
    thresholds: {
      1: "Lvl 1 Street thug",
      5: "Lvl 5 Enforcer",
      10: "Lvl 10 Consigliere",
      15: "Lvl 15 Underboss",
      20: "Lvl 20 Don",
      30: "Lvl 30 Godfather",
    },
    getProgress: () => Manager.Instance.getLevel(),
    triggers: [GameEvent.EndWave],
  },

  {
    description: "Discover the map.",
    thresholds: {
      "10%": "James Cook",
      "20%": "Marco Polo",
      "40%": "Hernán Cortés",
      "60%": "Ferdinand Magellan",
      "90%": "Christopher Columbus",
    },
    getProgress: () => {
      const surface = Manager.Instance.getSurface();
      const [discoveredTiles, discoverableTiles] = surface.getTiles().reduce(
        (acc, tile) => {
          if (tile.getType() === TileType.Void) {
            return acc;
          }

          acc[1]++;
          if (tile.isDiscovered()) {
            acc[0]++;
          }
          return acc;
        },
        [0, 0]
      );

      return (discoveredTiles / discoverableTiles) * 100;
    },
    triggers: [GameEvent.StartWave],
  },

  {
    description: "Defeat enemies.",
    thresholds: {
      30: "Bot basher",
      100: "Circuit smasher",
      500: "Metal mauler",
      1000: "Robo rampage",
      5000: "Mechanic menace",
      10000: "Robotic ruler",
    },
    getProgress: function () {
      const lastKilledEnemies = this.data.lastKilledEnemies ?? 0;
      const newProgress =
        this.internalProgress +
        Manager.Instance.getKilledEnemies() -
        lastKilledEnemies;
      this.data.lastKilledEnemies = Manager.Instance.getKilledEnemies();

      return newProgress;
    },
    triggers: [GameEvent.StatUpdate],
  },

  {
    description: "Discover the edge of the map.",
    thresholds: {
      1: "Edgelord",
    },
    getProgress: () =>
      VisibilityController.Instance.isEdgeDiscovered() ? 1 : 0,
    triggers: [GameEvent.StartWave],
  },

  {
    description: "Reach level 10 on easy mode.",
    thresholds: {
      10: "Humble beginnings",
    },
    getProgress: () =>
      Manager.Instance.getDifficulty() === Difficulty.Easy
        ? Manager.Instance.getLevel()
        : 0,
    triggers: [GameEvent.StartWave],
  },

  {
    description: "Reach level 10 on normal mode.",
    thresholds: {
      10: "Establishing dominance",
    },
    getProgress: () =>
      Manager.Instance.getDifficulty() === Difficulty.Normal
        ? Manager.Instance.getLevel()
        : 0,
    triggers: [GameEvent.StartWave],
  },

  {
    description: "Reach level 10 on hard mode.",
    thresholds: {
      10: "A force to be reckoned with",
    },
    getProgress: () =>
      Manager.Instance.getDifficulty() === Difficulty.Hard
        ? Manager.Instance.getLevel()
        : 0,
    triggers: [GameEvent.StartWave],
  },
];
