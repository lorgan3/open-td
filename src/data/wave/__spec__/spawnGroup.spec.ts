import { DiscoveryStatus } from "../../terrain/constants";
import Surface from "../../terrain/surface";
import Tile from "../../terrain/tile";
import SpawnGroup from "../SpawnGroup";

describe("SpawnGroup", () => {
  const surface = new Surface({
    width: 10,
    height: 10,
    generate: (x, y) => {
      const tile = new Tile(x, y);
      if (x >= 7) {
        tile.setDiscoveryStatus(DiscoveryStatus.Discovered);
      }
      return tile;
    },
  });

  it("gets the center when all spawn points are the same", () => {
    const tile = surface.getTile(5, 5)!;
    const spawnGroup = SpawnGroup.fromTiles([tile, tile], tile, surface);
    expect(spawnGroup.getCenter()).toEqual([5, 5]);
  });

  it("gets the center when 2 spawn points are next to each other", () => {
    const tile1 = surface.getTile(4, 5)!;
    const tile2 = surface.getTile(5, 5)!;
    const spawnGroup = SpawnGroup.fromTiles([tile1, tile2], tile1, surface);
    expect(spawnGroup.getCenter()).toEqual([4.5, 5]);
  });

  it("gets the center when 3 spawn points are next to each other", () => {
    const tile1 = surface.getTile(4, 5)!;
    const tile2 = surface.getTile(5, 5)!;
    const tile3 = surface.getTile(6, 5)!;
    const spawnGroup = SpawnGroup.fromTiles(
      [tile1, tile2, tile3],
      tile1,
      surface
    );
    expect(spawnGroup.getCenter()).toEqual([5, 5]);
  });

  it("is not exposed when no tiles are discovered", () => {
    const tile = surface.getTile(3, 3)!;

    const spawnGroup = SpawnGroup.fromTiles([tile], tile, surface);
    expect(spawnGroup.isExposed()).toEqual(0);
  });

  it("is exposed when some tiles are discovered", () => {
    const tile = surface.getTile(5, 5)!;

    const spawnGroup = SpawnGroup.fromTiles([tile], tile, surface);
    expect(spawnGroup.isExposed()).toEqual(0.14285714285714285);
  });

  it("is exposed when all tiles are discovered", () => {
    const tile = surface.getTile(9, 5)!;

    const spawnGroup = SpawnGroup.fromTiles([tile], tile, surface);
    expect(spawnGroup.isExposed()).toEqual(1);
  });
});
