import Surface from "../surface";

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
      case: "diagonal",
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

  it.only.each(rectTable)(
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
});
