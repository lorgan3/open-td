import Surface from "../surface";
import Tile from "../tile";

describe("surface", () => {
  const surface = new Surface(10, 5);

  it("can get tiles", () => {
    const tile = surface.getTile(0, 0)!;
    expect(tile.getX()).toEqual(0);
    expect(tile.getY()).toEqual(0);

    const tile2 = surface.getTile(3, 4)!;
    expect(tile2.getX()).toEqual(3);
    expect(tile2.getY()).toEqual(4);
  });

  it("gives undefined for tiles out of bounds", () => {
    expect(surface.getTile(-1, 0)).toBeUndefined();
    expect(surface.getTile(2, -3)).toBeUndefined();
    expect(surface.getTile(10, 0)).toBeUndefined();
    expect(surface.getTile(0, 10)).toBeUndefined();
  });

  it("can get a row", () => {
    const row = surface.getRow(2);

    expect(row.length).toEqual(10);
    row.forEach((tile) => expect(tile.getY()).toEqual(2));
  });

  it("can get a column", () => {
    const row = surface.getColumn(2);

    expect(row.length).toEqual(5);
    row.forEach((tile) => expect(tile.getX()).toEqual(2));
  });

  const lineTable = [
    {
      case: "horizontal",
      sourceX: 1,
      sourceY: 1,
      targetX: 4,
      targetY: 1,
      steps: [
        [1, 1],
        [2, 1],
        [3, 1],
        [4, 1],
      ],
    },
    {
      case: "vertical",
      sourceX: 1,
      sourceY: 4,
      targetX: 1,
      targetY: 1,
      steps: [
        [1, 4],
        [1, 3],
        [1, 2],
        [1, 1],
      ],
    },
    {
      case: "diagonal left",
      sourceX: 0,
      sourceY: 0,
      targetX: 4,
      targetY: 4,
      steps: [
        [0, 0],
        [1, 1],
        [2, 2],
        [3, 3],
        [4, 4],
      ],
    },
    {
      case: "diagonal right",
      sourceX: 4,
      sourceY: 0,
      targetX: 0,
      targetY: 4,
      steps: [
        [4, 0],
        [3, 1],
        [2, 2],
        [1, 3],
        [0, 4],
      ],
    },
    {
      case: "complex",
      sourceX: 7,
      sourceY: 4,
      targetX: 3,
      targetY: 3,
      steps: [
        [7, 4],
        [6, 4],
        [5, 4],
        [4, 3],
        [3, 3],
      ],
    },
    {
      case: "out of bounds",
      sourceX: 1,
      sourceY: 1,
      targetX: -5,
      targetY: 2,
      steps: [
        [1, 1],
        [0, 1],
      ],
    },
  ];

  it.each(lineTable)(
    "runs a function for every tile in a $case line from [$sourceX, $sourceY] to [$targetX, $targetY]",
    ({ sourceX, sourceY, targetX, targetY, steps }) => {
      const fn = jest.fn();
      surface.forLine(sourceX, sourceY, targetX, targetY, fn);

      expect(fn).toHaveBeenCalledTimes(steps.length);
      steps.forEach(([x, y], i) =>
        expect(fn).toHaveBeenNthCalledWith(
          i + 1,
          expect.objectContaining({ x, y })
        )
      );
    }
  );

  it.each(lineTable)(
    "runs a function for every tile in a $case ray from [$sourceX, $sourceY] with direction [$targetX, $targetY]",
    ({ sourceX, sourceY, targetX, targetY, steps }) => {
      const direction = Math.atan2(targetY - sourceY, targetX - sourceX);

      // Abort the ray when the target has been reached
      const fn = jest.fn(
        (tile: Tile) => tile.getX() !== targetX || tile.getY() !== targetY
      );
      surface.forRay(sourceX, sourceY, direction, fn);

      expect(fn).toHaveBeenCalledTimes(steps.length);
      steps.forEach(([x, y], i) =>
        expect(fn).toHaveBeenNthCalledWith(
          i + 1,
          expect.objectContaining({ x, y })
        )
      );
    }
  );

  const rectTable = [
    {
      case: "regular",
      sourceX: 1,
      sourceY: 1,
      targetX: 2,
      targetY: 2,
      steps: [
        [1, 1],
        [2, 1],
        [1, 2],
        [2, 2],
      ],
    },
    {
      case: "inverted",
      sourceX: 3,
      sourceY: 3,
      targetX: 2,
      targetY: 2,
      steps: [
        [3, 3],
        [2, 3],
        [3, 2],
        [2, 2],
      ],
    },
    {
      case: "out of bounds",
      sourceX: 7,
      sourceY: 3,
      targetX: 11,
      targetY: 5,
      steps: [
        [7, 3],
        [8, 3],
        [9, 3],
        [7, 4],
        [8, 4],
        [9, 4],
      ],
    },
  ];

  it.each(rectTable)(
    "runs a function for every tile in a $case rectangle from [$sourceX, $sourceY] to [$targetX, $targetY]",
    ({ sourceX, sourceY, targetX, targetY, steps }) => {
      const fn = jest.fn();
      surface.forRect(sourceX, sourceY, targetX, targetY, fn);

      expect(fn).toHaveBeenCalledTimes(steps.length);
      steps.forEach(([x, y], i) =>
        expect(fn).toHaveBeenNthCalledWith(
          i + 1,
          expect.objectContaining({ x, y })
        )
      );
    }
  );

  const circleTable = [
    {
      case: "tiny",
      x: 4,
      y: 2,
      d: 1,
      edgeOnly: false,
      steps: [[4, 2]],
    },
    {
      case: "small",
      x: 4,
      y: 2,
      d: 2,
      edgeOnly: false,
      steps: [
        [3, 1],
        [4, 1],
        [3, 2],
        [4, 2],
      ],
    },
    {
      case: "medium",
      x: 4,
      y: 2,
      d: 3,
      edgeOnly: false,
      steps: [
        [3, 1],
        [4, 1],
        [5, 1],
        [3, 2],
        [4, 2],
        [5, 2],
        [3, 3],
        [4, 3],
        [5, 3],
      ],
    },
    {
      case: "big out of bounds",
      x: 1,
      y: 1,
      d: 4,
      edgeOnly: false,
      steps: [
        [0, 0],
        [1, 0],
        [2, 0],
        [0, 1],
        [1, 1],
        [2, 1],
        [0, 2],
        [1, 2],
      ],
    },
    {
      case: "edges only",
      x: 2,
      y: 2,
      d: 5,
      edgeOnly: true,
      steps: [
        [1, 0],
        [2, 0],
        [3, 0],
        [0, 1],
        [4, 1],
        [0, 2],
        [4, 2],
        [0, 3],
        [4, 3],
        [1, 4],
        [2, 4],
        [3, 4],
      ],
    },
  ];

  it.each(circleTable)(
    "runs a function for every tile in a $case circle at [$x, $y] with d $d",
    ({ x, y, d, edgeOnly, steps }) => {
      const fn = jest.fn();
      surface.forCircle(x, y, d, fn, edgeOnly);

      expect(fn).toHaveBeenCalledTimes(steps.length);
      steps.forEach(([x, y], i) =>
        expect(fn).toHaveBeenNthCalledWith(
          i + 1,
          expect.objectContaining({ x, y })
        )
      );
    }
  );
});
