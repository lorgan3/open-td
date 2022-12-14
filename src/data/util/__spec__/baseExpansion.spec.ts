import { Difficulty } from "../../difficulty";
import Armory from "../../entity/armory";
import Surface from "../../terrain/surface";
import Tile from "../../terrain/tile";
import { floodFill } from "../baseExpansion";
import TestManager from "../../controllers/__spec__/testManager";
import { TileType } from "../../terrain/constants";
import Base from "../../entity/base";
import { vi } from "vitest";

describe("baseExpansion", () => {
  const surface = new Surface({ width: 8, height: 8 });
  const basePoint = surface.getTile(2, 2)!;
  const manager = new TestManager(
    Difficulty.Normal,
    new Base(basePoint),
    surface,
    vi.fn()
  );

  surface.spawnStatic(new Armory(surface.getTile(2, 4)!));
  surface.spawnStatic(new Armory(surface.getTile(2, 6)!));

  const emptySet = new Set<Tile>();

  it("flood fills when nothing changes", () => {
    expect(
      floodFill(emptySet, emptySet, manager.getBase(), surface)
    ).toBeTruthy();
  });

  it("flood fills when a valid tile is removed", () => {
    expect(
      floodFill(
        new Set([surface.getTile(2, 6)!]),
        emptySet,
        manager.getBase(),
        surface
      )
    ).toBeTruthy();
  });

  it("does not flood fill when an invalid tile is removed", () => {
    expect(
      floodFill(
        new Set([surface.getTile(2, 4)!]),
        emptySet,
        manager.getBase(),
        surface
      )
    ).toBeFalsy();
  });

  it("flood fills when the end result is valid", () => {
    expect(
      floodFill(
        new Set([surface.getTile(2, 4)!, surface.getTile(2, 6)!]),
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
        new Set([surface.getTile(4, 6)!]),
        manager.getBase(),
        surface
      )
    ).toBeTruthy();
  });

  it("does not flood fill when an invalid tile is added", () => {
    expect(
      floodFill(
        emptySet,
        new Set([surface.getTile(6, 6)!]),
        manager.getBase(),
        surface
      )
    ).toBeFalsy();
  });

  it("does not flood fill when its invalid because of a pending deletion", () => {
    expect(
      floodFill(
        new Set([surface.getTile(2, 4)!]),
        new Set([surface.getTile(4, 4)!]),
        manager.getBase(),
        surface
      )
    ).toBeFalsy();
  });

  it("flood fills the entire surface", () => {
    const tiles = new Set<Tile>();
    surface.forRect(
      0,
      0,
      6,
      6,
      (tile) => {
        if (tile.getType() !== TileType.Base) {
          tiles.add(tile);
        }
      },
      {
        scale: 2,
      }
    );

    expect(floodFill(emptySet, tiles, manager.getBase(), surface)).toBeTruthy();
  });
});
