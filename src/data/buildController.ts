import placeables, { Placeable, placeableEntityTypes } from "./placeables";
import Manager from "./manager";
import Blueprint from "./entity/Blueprint";
import Tile, { FREE_TILES, TileType } from "./terrain/tile";
import Surface from "./terrain/surface";
import { EntityType } from "./entity/entity";
import { GameEvent } from "./events";
import { canBuild, canSell } from "./util/baseExpansion";

class BuildController {
  private blueprints = new Map<string, Blueprint>();
  private deletePlaceable: Placeable;

  constructor(private surface: Surface) {
    this.deletePlaceable = placeables.find(
      (placeable) => placeable.entityType === EntityType.None
    )!;
  }

  build(selection: Tile[], placeable: Placeable) {
    let affectedTiles: Tile[];
    if (placeable.entityType === EntityType.None) {
      if (Manager.Instance.getIsStarted()) {
        affectedTiles = this.sellBlueprints(selection);
      } else {
        affectedTiles = this.sellEntities(selection);
      }

      Manager.Instance.triggerEvent(GameEvent.SurfaceChange, {
        affectedTiles,
      });
      return;
    }

    if (Manager.Instance.getIsStarted()) {
      affectedTiles = this.placeBlueprints(selection, placeable);
    } else {
      affectedTiles = this.placeEntities(selection, placeable);
    }

    Manager.Instance.triggerEvent(GameEvent.SurfaceChange, {
      affectedTiles,
    });
  }

  commit() {
    const tiles: Tile[] = [];

    this.blueprints.forEach((blueprint) => {
      const tile = blueprint.getTile();
      this.surface.despawn(blueprint);
      tiles.push(tile);

      if (tile.hasStaticEntity()) {
        const agent = tile.getStaticEntity().getAgent();
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
    Manager.Instance.triggerStatUpdate();
  }

  private placeBlueprints(selection: Tile[], placeable: Placeable) {
    const validTiles = selection.filter((tile) => {
      if (!FREE_TILES.has(tile.getBaseType())) {
        return false;
      }

      if (
        tile.hasStaticEntity() &&
        !placeableEntityTypes.has(tile.getStaticEntity().getAgent().getType())
      ) {
        return false;
      }

      if (placeable.isBasePart && !canBuild(tile, this.surface)) {
        return false;
      }

      return true;
    });

    if (!Manager.Instance.buy(placeable, validTiles.length)) {
      return [];
    }

    validTiles.forEach((tile) => {
      const currentBlueprint = this.blueprints.get(tile.getHash());
      if (currentBlueprint) {
        Manager.Instance.sell(currentBlueprint);
        this.surface.despawn(currentBlueprint);
      }

      const blueprint = new Blueprint(tile, placeable);
      this.surface.spawn(blueprint);
      this.blueprints.set(tile.getHash(), blueprint);
    });

    Manager.Instance.triggerStatUpdate();
    return validTiles;
  }

  private sellBlueprints(selection: Tile[]) {
    const affectedTiles: Tile[] = [];
    let unsellableBaseParts = 0;
    selection.forEach((tile) => {
      const hash = tile.getHash();
      if (this.blueprints.has(hash)) {
        const blueprint = this.blueprints.get(hash)!;
        if (!blueprint.isDelete()) {
          Manager.Instance.sell(blueprint);
        }

        this.blueprints.delete(hash);
        this.surface.despawn(blueprint);
        return;
      }

      if (
        !tile.hasStaticEntity() ||
        !placeableEntityTypes.has(tile.getStaticEntity().getAgent().getType())
      ) {
        return;
      }

      if (tile.getType() === TileType.Base) {
        unsellableBaseParts++;
        return;
      }

      affectedTiles.push(tile);
      const blueprint = new Blueprint(tile, this.deletePlaceable);
      this.surface.spawn(blueprint);
      this.blueprints.set(tile.getHash(), blueprint);
    });

    if (unsellableBaseParts > 0) {
      Manager.Instance.showMessage(
        `${unsellableBaseParts} base parts can't be sold during the attack phase`,
        { override: true }
      );
    }
    Manager.Instance.triggerStatUpdate();
    return affectedTiles;
  }

  private placeEntities(selection: Tile[], placeable: Placeable) {
    const validTiles = selection.filter((tile) => {
      if (!FREE_TILES.has(tile.getBaseType())) {
        return false;
      }

      if (tile.hasStaticEntity()) {
        return false;
      }

      if (placeable.isBasePart && !canBuild(tile, this.surface)) {
        return false;
      }

      return true;
    });

    if (!Manager.Instance.buy(placeable, validTiles.length)) {
      return [];
    }

    validTiles.forEach((tile) => {
      this.surface.spawnStatic(new placeable.entity!(tile));
    });

    Manager.Instance.triggerStatUpdate();
    return validTiles;
  }

  private sellEntities(selection: Tile[]) {
    const affectedTiles: Tile[] = [];
    let unsellableBaseParts = 0;
    selection.forEach((tile) => {
      if (
        !tile.hasStaticEntity() ||
        !placeableEntityTypes.has(tile.getStaticEntity().getAgent().getType())
      ) {
        return;
      }

      if (
        tile.getType() === TileType.Base &&
        !canSell(tile, Manager.Instance.getBase(), this.surface)
      ) {
        unsellableBaseParts++;
        return;
      }

      affectedTiles.push(tile);
      const agent = tile.getStaticEntity().getAgent();
      this.surface.despawnStatic(agent);
      Manager.Instance.sell(agent);
    });

    if (unsellableBaseParts > 0) {
      Manager.Instance.showMessage(
        `${unsellableBaseParts} tiles can't be sold because they're integral parts of your base.`,
        { override: true }
      );
    }
    Manager.Instance.triggerStatUpdate();
    return affectedTiles;
  }
}

export default BuildController;
