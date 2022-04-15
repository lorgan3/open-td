import Path from "../../terrain/path";
import Tile from "../../terrain/tile";
import SpawnGroup from "../SpawnGroup";

describe("spawnGroup", () => {
  it("gets the next spawn point", () => {
    const path1 = Path.fromTiles([new Tile(0, 0)], 1);
    const path2 = Path.fromTiles([new Tile(1, 1)], 2);
    const path3 = Path.fromTiles([new Tile(2, 2)], 3);

    const spawnGroup = new SpawnGroup([path1, path2, path3]);

    expect(spawnGroup.getNextSpawnPoint()).toEqual(path1);
    expect(spawnGroup.getNextSpawnPoint()).toEqual(path2);
    expect(spawnGroup.getNextSpawnPoint()).toEqual(path3);
    expect(spawnGroup.getNextSpawnPoint()).toEqual(path1);
  });
});
