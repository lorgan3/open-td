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
});
