import Path from "../path";
import Tile, { TileType } from "../tile";

describe("path", () => {
  const speed = 1;
  const speedMultipliers = { [TileType.Grass]: 2 };
  const tiles = [
    new Tile(0, 0),
    new Tile(1, 0, TileType.Grass),
    new Tile(2, 0, TileType.Grass),
    new Tile(3, 1),
  ];
  const path = Path.fromTiles(tiles, speed, speedMultipliers);

  it("constructs from an array of tiles", () => {
    expect(path).toEqual(
      expect.objectContaining({
        sections: [
          { from: 0, to: 1, speedMultiplier: 1 },
          { from: 1, to: 3, speedMultiplier: 2 },
          { from: 3, to: 4, speedMultiplier: 1 },
        ],
      })
    );
  });

  it("clones a path", () => {
    const clone = path.clone();
    expect(clone).toEqual(path);
    expect(clone).not.toBe(path);
  });
});
