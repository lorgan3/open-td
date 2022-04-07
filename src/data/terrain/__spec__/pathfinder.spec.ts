import PathFinder from "../pathFinder";
import Surface from "../surface";
import Tile, { TileType } from "../tile";

describe("pathfinder", () => {
  const surface = new Surface(5, 5, (x, y) => new Tile(x, y, TileType.Grass));
  surface.forLine(2, 0, 2, 3, (tile) =>
    surface.setTile(new Tile(tile.getX(), tile.getY(), TileType.Water))
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
        [4, 4],
        [3, 4],
        [2, 4],
        [1, 4],
        [0, 4],
      ],
    },
    {
      case: "curved",
      sourceX: 0,
      sourceY: 0,
      targetX: 4,
      targetY: 0,
      steps: [
        [4, 0],
        [4, 1],
        [4, 2],
        [3, 3],
        [2, 4],
        [1, 3],
        [1, 2],
        [1, 1],
        [0, 0],
      ],
    },
  ];

  it.each(table)(
    "finds a $case path from [$sourceX, $sourceY] to [$targetX, $targetY]",
    ({ sourceX, sourceY, targetX, targetY, steps }) => {
      const path = pathfinder.getPath(
        surface.getTile(sourceX, sourceY)!,
        surface.getTile(targetX, targetY)!
      )!;

      expect(path).toHaveLength(steps.length);
      steps.forEach(([x, y], i) =>
        expect(path[i]).toEqual(expect.objectContaining({ x, y }))
      );
    }
  );
});
