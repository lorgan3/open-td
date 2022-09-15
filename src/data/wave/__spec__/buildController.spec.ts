import BuildController from "../../buildController";
import Blueprint from "../../entity/Blueprint";
import { EntityType } from "../../entity/entity";
import placeables, { ARMORY, DEMOLISH, TOWER } from "../../placeables";
import Surface from "../../terrain/surface";
import Tile from "../../terrain/tile";

describe("buildController", () => {
  const emptySet = new Set<Tile>();

  it("can add a pending tile", () => {
    const surface = new Surface(5, 5);
    const controller = new BuildController(surface);

    const selectedTile = surface.getTile(2, 2)!;

    expect(controller.getPendingTiles([selectedTile])).toEqual({
      pendingBaseAdditions: new Set([selectedTile]),
      pendingBaseRemovals: emptySet,
    });
  });

  it("can remove a pending tile", () => {
    const surface = new Surface(5, 5);
    const controller = new BuildController(surface);

    const selectedTile = surface.getTile(2, 2)!;

    expect(controller.getPendingTiles([selectedTile], true)).toEqual({
      pendingBaseAdditions: emptySet,
      pendingBaseRemovals: new Set([selectedTile]),
    });
  });

  it("can undo an existing removal by overwriting it", () => {
    const surface = new Surface(5, 5);
    const controller = new BuildController(surface);

    const selectedTile = surface.getTile(2, 2)!;

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
    const controller = new BuildController(surface);

    const selectedTile = surface.getTile(2, 2)!;

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
    const controller = new BuildController(surface);

    const selectedTile = surface.getTile(2, 2)!;

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
    const controller = new BuildController(surface);

    const selectedTile = surface.getTile(2, 2)!;

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
    const controller = new BuildController(surface);

    const selectedTile = surface.getTile(2, 2)!;

    const blueprint = new Blueprint(selectedTile, TOWER);
    controller["blueprints"].set(selectedTile.getHash(), blueprint);

    expect(controller.getPendingTiles([selectedTile])).toEqual({
      pendingBaseAdditions: new Set([selectedTile]),
      pendingBaseRemovals: emptySet,
    });
  });
});
