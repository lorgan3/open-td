import Path from "../../terrain/path";
import Tile from "../../terrain/tile";
import SpawnGroup from "../SpawnGroup";
import Wave from "../wave";

describe("wave", () => {
  const spawnGroup1 = new SpawnGroup([Path.fromTiles([new Tile(0, 0)], 1)]);
  const spawnGroup2 = new SpawnGroup([Path.fromTiles([new Tile(1, 1)], 2)]);
  const spawnGroup3 = new SpawnGroup([Path.fromTiles([new Tile(2, 2)], 3)]);
  const spawnGroups = [spawnGroup1, spawnGroup2, spawnGroup3];

  const table = [
    {
      level: 0,
      expectedSpawnGroups: [spawnGroup1],
    },
    {
      level: 1,
      expectedSpawnGroups: [spawnGroup2],
    },
    {
      level: 2,
      expectedSpawnGroups: [spawnGroup3],
    },
    {
      level: 3,
      expectedSpawnGroups: [spawnGroup1],
    },
    {
      level: 4,
      expectedSpawnGroups: [spawnGroup2],
    },
    {
      level: 5,
      expectedSpawnGroups: [spawnGroup1, spawnGroup2],
    },
    {
      level: 6,
      expectedSpawnGroups: [spawnGroup3],
    },
    {
      level: 7,
      expectedSpawnGroups: [spawnGroup1, spawnGroup3],
    },
    {
      level: 8,
      expectedSpawnGroups: [spawnGroup2, spawnGroup3],
    },
  ];

  it.each(table)(
    "it creates a wave for level $level",
    ({ level, expectedSpawnGroups }) => {
      expect(Wave.fromLevel(level, spawnGroups).getSpawnGroups()).toEqual(
        expectedSpawnGroups
      );
    }
  );
});
