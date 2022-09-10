import Controller from "../../controller";
import Armory from "../../entity/Armory";
import Manager from "../../manager";
import Surface from "../../terrain/surface";
import Tile, { TileType } from "../../terrain/tile";
import { floodFill } from "../baseExpansion";

describe("baseExpansion", () => {
  const surface = new Surface(5, 5);
  const basePoint = surface.getTile(2, 2)!;
  const manager = new Manager(
    basePoint,
    surface,
    new Controller(surface),
    jest.fn()
  );

  surface.spawnStatic(new Armory(surface.getTile(2, 3)!));
  surface.spawnStatic(new Armory(surface.getTile(2, 4)!));

  const emptySet = new Set<Tile>();

  it("flood fills when nothing changes", () => {
    expect(
      floodFill(emptySet, emptySet, manager.getBase(), surface)
    ).toBeTruthy();
  });

  it("flood fills when a valid tile is removed", () => {
    expect(
      floodFill(
        new Set([surface.getTile(2, 4)!]),
        emptySet,
        manager.getBase(),
        surface
      )
    ).toBeTruthy();
  });

  it("does not flood fill when an invalid tile is removed", () => {
    expect(
      floodFill(
        new Set([surface.getTile(2, 3)!]),
        emptySet,
        manager.getBase(),
        surface
      )
    ).toBeFalsy();
  });

  it("flood fills when the end result is valid", () => {
    expect(
      floodFill(
        new Set([surface.getTile(2, 3)!, surface.getTile(2, 4)!]),
        emptySet,
        manager.getBase(),
        surface
      )
    ).toBeTruthy();
  });

  it("flood fills when a valid tile is added", () => {
    expect(
      floodFill(
        emptySet,
        new Set([surface.getTile(3, 4)!]),
        manager.getBase(),
        surface
      )
    ).toBeTruthy();
  });

  it("does not flood fill when an invalid tile is added", () => {
    expect(
      floodFill(
        emptySet,
        new Set([surface.getTile(4, 4)!]),
        manager.getBase(),
        surface
      )
    ).toBeFalsy();
  });

  it("does not flood fill when its invalid because of a pending deletion", () => {
    expect(
      floodFill(
        new Set([surface.getTile(2, 4)!]),
        new Set([surface.getTile(3, 4)!]),
        manager.getBase(),
        surface
      )
    ).toBeFalsy();
  });

  it("flood fills the entire surface", () => {
    const tiles = new Set<Tile>();
    surface.forRect(0, 0, 4, 4, (tile) => {
      if (tile.getType() !== TileType.Base) {
        tiles.add(tile);
      }
    });

    expect(floodFill(emptySet, tiles, manager.getBase(), surface)).toBeTruthy();
  });
});