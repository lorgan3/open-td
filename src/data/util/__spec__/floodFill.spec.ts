import { Difficulty } from "../../difficulty";
import Armory from "../../entity/armory";
import Surface from "../../terrain/surface";
import Tile from "../../terrain/tile";
import { ensureBaseIsContinuous, getStructureSize } from "../floodFill";
import TestManager from "../../controllers/__spec__/testManager";
import { TileType } from "../../terrain/constants";
import Base from "../../entity/base";
import { vi } from "vitest";
import { EntityType } from "../../entity/constants";

describe("floodFill", () => {
  const surface = new Surface({ width: 8, height: 8 });
  const basePoint = surface.getTile(2, 2)!;
  const manager = new TestManager(
    Difficulty.Normal,
    new Base(basePoint),
    surface,
    vi.fn()
  );

  const armory = new Armory(surface.getTile(2, 4)!);
  surface.spawnStatic(armory);
  surface.spawnStatic(new Armory(surface.getTile(2, 6)!));
  surface.spawnStatic(new Armory(surface.getTile(4, 2)!));

  const emptySet = new Set<Tile>();

  it("flood fills when nothing changes", () => {
    expect(
      ensureBaseIsContinuous(emptySet, emptySet, manager.getBase(), surface)
    ).toBeTruthy();
  });

  it("flood fills when a valid tile is removed", () => {
    expect(
      ensureBaseIsContinuous(
        new Set([surface.getTile(2, 6)!]),
        emptySet,
        manager.getBase(),
        surface
      )
    ).toBeTruthy();
  });

  it("does not flood fill when an invalid tile is removed", () => {
    expect(
      ensureBaseIsContinuous(
        new Set([surface.getTile(2, 4)!]),
        emptySet,
        manager.getBase(),
        surface
      )
    ).toBeFalsy();
  });

  it("flood fills when the end result is valid", () => {
    expect(
      ensureBaseIsContinuous(
        new Set([surface.getTile(2, 4)!, surface.getTile(2, 6)!]),
        emptySet,
        manager.getBase(),
        surface
      )
    ).toBeTruthy();
  });

  it("flood fills when a valid tile is added", () => {
    expect(
      ensureBaseIsContinuous(
        emptySet,
        new Set([surface.getTile(4, 6)!]),
        manager.getBase(),
        surface
      )
    ).toBeTruthy();
  });

  it("does not flood fill when an invalid tile is added", () => {
    expect(
      ensureBaseIsContinuous(
        emptySet,
        new Set([surface.getTile(6, 6)!]),
        manager.getBase(),
        surface
      )
    ).toBeFalsy();
  });

  it("does not flood fill when its invalid because of a pending deletion", () => {
    expect(
      ensureBaseIsContinuous(
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

    expect(
      ensureBaseIsContinuous(emptySet, tiles, manager.getBase(), surface)
    ).toBeTruthy();
  });

  it("gets the size of adjacent armories", () => {
    expect(
      getStructureSize(armory.getTile(), surface, new Set([EntityType.Armory]))
    ).toEqual(2);
  });

  it("gets the size of adjacent and diagonal armories", () => {
    expect(
      getStructureSize(
        armory.getTile(),
        surface,
        new Set([EntityType.Armory]),
        true
      )
    ).toEqual(3);
  });

  it("gets the size of armories and bases", () => {
    expect(
      getStructureSize(
        armory.getTile(),
        surface,
        new Set([EntityType.Armory, EntityType.Base])
      )
    ).toEqual(4);
  });
});
