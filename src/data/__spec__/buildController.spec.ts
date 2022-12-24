import BuildController from "../controllers/buildController";
import TestManager from "../controllers/__spec__/testManager";
import { Difficulty } from "../difficulty";
import Base from "../entity/base";
import Blueprint from "../entity/blueprint";
import { ARMORY, DEMOLISH, TOWER } from "../placeables";
import Surface from "../terrain/surface";
import Tile from "../terrain/tile";
import { vi } from "vitest";

describe("buildController", () => {
  const emptySet = new Set<Tile>();

  it("can add a pending tile", () => {
    const surface = new Surface(5, 5);
    const selectedTile = surface.getTile(2, 2)!;
    new TestManager(
      Difficulty.Normal,
      new Base(selectedTile),
      surface,
      vi.fn()
    );
    const controller = new BuildController(surface);

    expect(controller.getPendingTiles([selectedTile])).toEqual({
      pendingBaseAdditions: new Set([selectedTile]),
      pendingBaseRemovals: emptySet,
    });
  });

  it("can remove a pending tile", () => {
    const surface = new Surface(5, 5);
    const selectedTile = surface.getTile(2, 2)!;
    new TestManager(
      Difficulty.Normal,
      new Base(selectedTile),
      surface,
      vi.fn()
    );
    const controller = new BuildController(surface);

    expect(controller.getPendingTiles([selectedTile], true)).toEqual({
      pendingBaseAdditions: emptySet,
      pendingBaseRemovals: new Set([selectedTile]),
    });
  });

  it("can undo an existing removal by overwriting it", () => {
    const surface = new Surface(5, 5);
    const selectedTile = surface.getTile(2, 2)!;
    new TestManager(
      Difficulty.Normal,
      new Base(selectedTile),
      surface,
      vi.fn()
    );
    const controller = new BuildController(surface);

    const blueprint = new Blueprint(selectedTile, DEMOLISH);
    controller["pendingBaseRemovals"] = [blueprint];
    controller["blueprints"].set(selectedTile.getHash(), blueprint);

    expect(controller.getPendingTiles([selectedTile])).toEqual({
      pendingBaseAdditions: emptySet,
      pendingBaseRemovals: emptySet,
    });
  });

  it("can undo an existing removal by removing it", () => {
    const surface = new Surface(5, 5);
    const selectedTile = surface.getTile(2, 2)!;
    new TestManager(
      Difficulty.Normal,
      new Base(selectedTile),
      surface,
      vi.fn()
    );
    const controller = new BuildController(surface);

    const blueprint = new Blueprint(selectedTile, DEMOLISH);
    controller["pendingBaseRemovals"] = [blueprint];
    controller["blueprints"].set(selectedTile.getHash(), blueprint);

    expect(controller.getPendingTiles([selectedTile], true)).toEqual({
      pendingBaseAdditions: emptySet,
      pendingBaseRemovals: emptySet,
    });
  });

  it("can undo an existing addition by removing it", () => {
    const surface = new Surface(5, 5);
    const selectedTile = surface.getTile(2, 2)!;
    new TestManager(
      Difficulty.Normal,
      new Base(selectedTile),
      surface,
      vi.fn()
    );
    const controller = new BuildController(surface);

    const blueprint = new Blueprint(selectedTile, ARMORY);
    controller["pendingBaseAdditions"] = [blueprint];
    controller["blueprints"].set(selectedTile.getHash(), blueprint);

    expect(controller.getPendingTiles([selectedTile], true)).toEqual({
      pendingBaseAdditions: emptySet,
      pendingBaseRemovals: emptySet,
    });
  });

  it("can overwrite an existing base blueprint", () => {
    const surface = new Surface(5, 5);
    const selectedTile = surface.getTile(2, 2)!;
    new TestManager(
      Difficulty.Normal,
      new Base(selectedTile),
      surface,
      vi.fn()
    );
    const controller = new BuildController(surface);

    const blueprint = new Blueprint(selectedTile, ARMORY);
    controller["pendingBaseAdditions"] = [blueprint];
    controller["blueprints"].set(selectedTile.getHash(), blueprint);

    expect(controller.getPendingTiles([selectedTile])).toEqual({
      pendingBaseAdditions: new Set([selectedTile]),
      pendingBaseRemovals: emptySet,
    });
  });

  it("can overwrite an existing tower blueprint", () => {
    const surface = new Surface(5, 5);
    const selectedTile = surface.getTile(2, 2)!;
    new TestManager(
      Difficulty.Normal,
      new Base(selectedTile),
      surface,
      vi.fn()
    );
    const controller = new BuildController(surface);

    const blueprint = new Blueprint(selectedTile, TOWER);
    controller["blueprints"].set(selectedTile.getHash(), blueprint);

    expect(controller.getPendingTiles([selectedTile])).toEqual({
      pendingBaseAdditions: new Set([selectedTile]),
      pendingBaseRemovals: emptySet,
    });
  });
});
