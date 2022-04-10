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

  describe("getPathSection", () => {
    const table = [
      {
        index: 0,
        speed: 0,
        expectedSection: { from: tiles[0], to: tiles[1], step: 0 },
        expectedIndex: 0,
      },
      {
        index: 0.1,
        speed: 0,
        expectedSection: { from: tiles[0], to: tiles[1], step: 0.1 },
        expectedIndex: 0.1,
      },
      {
        index: 2.5,
        speed: 0,
        expectedSection: { from: tiles[2], to: tiles[3], step: 0.5 },
        expectedIndex: 2.5,
      },
      {
        index: 2.5,
        speed: 5,
        expectedSection: { from: tiles[2], to: tiles[3], step: 0.5 },
        expectedIndex: 3,
      },
      {
        index: 0.5,
        speed: 5,
        expectedSection: { from: tiles[0], to: tiles[3], step: 0.5 },
        expectedIndex: 3,
      },
    ];

    it.each(table)(
      "gets a section of a path at $index with speed $speed",
      ({ index, speed, expectedSection, expectedIndex }) => {
        const path = Path.fromTiles(tiles, speed);
        path.setIndex(index);

        const section = path.performStep(1);
        expect(section).toEqual(expectedSection);
        expect(path.getIndex()).toEqual(expectedIndex);
      }
    );
  });

  describe("getFuturePosition", () => {
    const table = [
      {
        index: 0,
        time: 750,
        speed: 0.001,
        speedMultipliers: {},
        expected: 0.75,
      },
      {
        index: 0.5,
        time: 750,
        speed: 0.001,
        speedMultipliers: {},
        expected: 1.25,
      },
      {
        index: 2,
        time: 2000,
        speed: 0.001,
        speedMultipliers: {},
        expected: 3,
      },
      {
        index: 0,
        time: 2000,
        speed: 0.001,
        speedMultipliers: { [TileType.Grass]: 2 },
        expected: 1.5,
      },
      {
        index: 0.5,
        time: 750,
        speed: 0.001,
        speedMultipliers: { [TileType.Grass]: 2 },
        expected: 1.125,
      },
    ];

    it.each(table)(
      "gets the future position after $time ms with starting position $index and speed $speed",
      ({ index, time, speed, speedMultipliers, expected }) => {
        const path = Path.fromTiles(tiles, speed, speedMultipliers);
        path.setIndex(index);

        expect(path.getFuturePosition(time)).toEqual(expected);
      }
    );
  });
});
