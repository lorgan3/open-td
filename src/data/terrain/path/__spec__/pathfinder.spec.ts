import PathFinder from "../pathFinder";
import Surface from "../../surface";
import Tile from "../../tile";
import { TileType } from "../../constants";

describe("pathfinder", () => {
  const surface = new Surface(5, 5, (x, y) => new Tile(x, y, TileType.Grass));
  surface.forLine(2, 0, 2, 3, (tile) =>
    surface.setTile(new Tile(tile.getX(), tile.getY(), TileType.Void))
  );

  const pathfinder = new PathFinder(surface);

  const table = [
    {
      case: "straight",
      sourceX: 0,
      sourceY: 4,
      targetX: 4,
      targetY: 4,
      steps: [
        [0, 4],
        [1, 4],
        [2, 4],
        [3, 4],
        [4, 4],
      ],
    },
    {
      case: "curved",
      sourceX: 0,
      sourceY: 0,
      targetX: 4,
      targetY: 0,
      steps: [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [1, 4],
        [2, 4],
        [3, 4],
        [3, 3],
        [3, 2],
        [3, 1],
        [4, 0],
      ],
    },
  ];

  it.each(table)(
    "finds a $case path from [$sourceX, $sourceY] to [$targetX, $targetY]",
    ({ sourceX, sourceY, targetX, targetY, steps }) => {
      const path = pathfinder
        .getPath(
          surface.getTile(sourceX, sourceY)!,
          surface.getTile(targetX, targetY)!
        )!
        .getTiles();

      expect(path).toHaveLength(steps.length);
      steps.forEach(([x, y], i) =>
        expect(path[i]).toEqual(expect.objectContaining({ x, y }))
      );
    }
  );

  it("finds a path around tiles with a higher multiplier", () => {
    // Avoid tile [4, 2] even though the movement cost is the same
    const multiplierFn = (tile: Tile) =>
      tile.getX() === 4 && tile.getY() === 2 ? 100 : 1;

    const path = pathfinder
      .getPath(surface.getTile(4, 0)!, surface.getTile(4, 4)!, multiplierFn)!
      .getTiles();

    const steps = [
      [4, 0],
      [3, 1],
      [3, 2],
      [3, 3],
      [4, 4],
    ];

    expect(path).toHaveLength(steps.length);
    steps.forEach(([x, y], i) =>
      expect(path[i]).toEqual(expect.objectContaining({ x, y }))
    );
  });

  describe("getCost", () => {
    const surface = new Surface(5, 5, (x, y) => new Tile(x, y, TileType.Grass));
    surface.forLine(2, 0, 2, 3, (tile) =>
      surface.setTile(new Tile(tile.getX(), tile.getY(), TileType.Stone))
    );

    const pathfinder = new PathFinder(surface, () => 1, {
      [TileType.Grass]: 1,
      [TileType.Stone]: 2,
    });

    const table = [
      {
        from: surface.getTile(2, 0)!,
        to: undefined,
        cost: 2,
      },
      {
        from: surface.getTile(2, 0)!,
        to: surface.getTile(3, 0)!,
        cost: 1.5,
      },
      {
        from: surface.getTile(1, 0)!,
        to: surface.getTile(2, 0)!,
        cost: 1.5,
      },
      {
        from: surface.getTile(2, 0)!,
        to: surface.getTile(3, 1)!,
        cost: 2.25,
      },

      {
        from: surface.getTile(0, 0)!,
        to: surface.getTile(1, 1)!,
        cost: 1.5,
      },
    ];

    it.each(table)(
      "gets the cost when moving from $from to $to",
      ({ from, to, cost }) => {
        expect(pathfinder.getCost(from, to)).toEqual(cost);
      }
    );
  });
});
