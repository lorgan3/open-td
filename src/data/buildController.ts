import placeables, { Placeable, placeableEntityTypes } from "./placeables";
import Manager from "./manager";
import Blueprint from "./entity/Blueprint";
import Tile, { FREE_TILES } from "./terrain/tile";
import Surface from "./terrain/surface";
import { EntityType } from "./entity/entity";
import { GameEvent } from "./events";

class BuildController {
  private blueprints = new Map<string, Blueprint>();
  private deletePlaceable: Placeable;

  constructor(private surface: Surface) {
    this.deletePlaceable = placeables.find(
      (placeable) => placeable.entityType === EntityType.None
    )!;
  }

  build(selection: Tile[], placeable: Placeable) {
    if (placeable.entityType === EntityType.None) {
      if (Manager.Instance.getIsStarted()) {
        this.sellBlueprints(selection);
      } else {
        this.sellEntities(selection);
      }

      Manager.Instance.triggerEvent(GameEvent.SurfaceChange, {
        affectedTiles: selection,
      });
      return;
    }

    if (Manager.Instance.getIsStarted()) {
      this.placeBlueprints(selection, placeable);
    } else {
      this.placeEntities(selection, placeable);
    }

    Manager.Instance.triggerEvent(GameEvent.SurfaceChange, {
      affectedTiles: selection,
    });
  }

  commit() {
    const tiles: Tile[] = [];

    this.blueprints.forEach((blueprint) => {
      const tile = blueprint.getTile();
      this.surface.despawn(blueprint);
      tiles.push(tile);

      if (tile.hasStaticEntity()) {
        const agent = tile.getStaticEntity()!.getAgent();
        Manager.Instance.sell(agent);
        this.surface.despawnStatic(agent);
      }

      if (blueprint.isDelete()) {
        return;
      }

      const constructor = blueprint.getPlaceable().entity!;
      this.surface.spawnStatic(new constructor(tile));
    });

    this.blueprints.clear();
    Manager.Instance.triggerEvent(GameEvent.SurfaceChange, {
      affectedTiles: tiles,
    });
  }

  private placeBlueprints(selection: Tile[], placeable: Placeable) {
    const validTiles = selection.filter((tile) => {
      if (!FREE_TILES.has(tile.getBaseType())) {
        return false;
      }

      if (
        tile.hasStaticEntity() &&
        !placeableEntityTypes.has(tile.getStaticEntity()!.getAgent().getType())
      ) {
        return false;
      }

      return true;
    });

    if (!Manager.Instance.buy(placeable, validTiles.length)) {
      return;
    }

    validTiles.forEach((tile) => {
      const currentBlueprint = this.blueprints.get(tile.getHash());
      if (currentBlueprint) {
        this.surface.despawn(currentBlueprint);
        Manager.Instance.sell(currentBlueprint);
      }

      const blueprint = new Blueprint(tile, placeable);
      this.surface.spawn(blueprint);
      this.blueprints.set(tile.getHash(), blueprint);
    });
  }

  private sellBlueprints(selection: Tile[]) {
    selection.forEach((tile) => {
      const hash = tile.getHash();
      if (this.blueprints.has(hash)) {
        const blueprint = this.blueprints.get(hash)!;
        if (!blueprint.isDelete()) {
          Manager.Instance.sell(blueprint);
        }

        this.blueprints.delete(hash);
        return;
      }

      if (
        !tile.hasStaticEntity() ||
        !placeableEntityTypes.has(tile.getStaticEntity()!.getAgent().getType())
      ) {
        return;
      }

      const blueprint = new Blueprint(tile, this.deletePlaceable);
      this.surface.spawn(blueprint);
      this.blueprints.set(tile.getHash(), blueprint);
    });
  }

  private placeEntities(selection: Tile[], placeable: Placeable) {
    const validTiles = selection.filter((tile) => {
      if (!FREE_TILES.has(tile.getBaseType())) {
        return false;
      }

      if (tile.hasStaticEntity()) {
        return false;
      }

      return true;
    });

    if (!Manager.Instance.buy(placeable, validTiles.length)) {
      return;
    }

    validTiles.forEach((tile) => {
      this.surface.spawnStatic(new placeable.entity!(tile));
    });
  }

  private sellEntities(selection: Tile[]) {
    selection.forEach((tile) => {
      if (
        !tile.hasStaticEntity() ||
        !placeableEntityTypes.has(tile.getStaticEntity()!.getAgent().getType())
      ) {
        return;
      }

      const agent = tile.getStaticEntity()!.getAgent();
      this.surface.despawnStatic(agent);
      Manager.Instance.sell(agent);
    });
  }
}

export default BuildController;
