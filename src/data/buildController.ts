import placeables, { Placeable, placeableEntityTypes } from "./placeables";
import Manager from "./manager";
import Blueprint from "./entity/Blueprint";
import Tile, { FREE_TILES } from "./terrain/tile";
import Surface from "./terrain/surface";
import { EntityType } from "./entity/entity";
import { GameEvent } from "./events";
import { floodFill } from "./util/baseExpansion";

export const BASE_PARTS = new Set([
  EntityType.Armory,
  EntityType.Radar,
  EntityType.Market,
  EntityType.PowerPlant,
]);

class BuildController {
  private blueprints = new Map<string, Blueprint>();
  private deletePlaceable: Placeable;

  private pendingBaseAdditions: Blueprint[] = [];
  private pendingBaseRemovals: Blueprint[] = [];

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
    this.pendingBaseAdditions = [];
    this.pendingBaseRemovals = [];
    Manager.Instance.triggerEvent(GameEvent.SurfaceChange, {
      affectedTiles: tiles,
    });
    Manager.Instance.triggerStatUpdate();
  }

  private placeBlueprints(selection: Tile[], placeable: Placeable) {
    const validTiles = selection.filter((tile) =>
      this.checkIsFree(tile, placeable.entity!.scale, true)
    );

    if (placeable.isBasePart) {
      const { pendingBaseAdditions, pendingBaseRemovals } =
        this.getPendingTiles(selection);
      if (
        !floodFill(
          pendingBaseRemovals,
          pendingBaseAdditions,
          Manager.Instance.getBase(),
          this.surface
        )
      ) {
        Manager.Instance.showMessage("Not all tiles connect to the base", {
          override: true,
        });

        return [];
      }
    }

    if (!Manager.Instance.buy(placeable, validTiles.length)) {
      return [];
    }

    validTiles.forEach((tile) => {
      const currentBlueprint = this.blueprints.get(tile.getHash());
      if (currentBlueprint) {
        Manager.Instance.sell(currentBlueprint);
        this.surface.despawn(currentBlueprint);

        if (currentBlueprint.isBasePart()) {
          this.pendingBaseAdditions.splice(
            this.pendingBaseAdditions.indexOf(currentBlueprint),
            1
          );
        } else if (
          tile.hasStaticEntity() &&
          BASE_PARTS.has(tile.getStaticEntity().getAgent().getType())
        ) {
          this.pendingBaseRemovals.splice(
            this.pendingBaseRemovals.indexOf(currentBlueprint),
            1
          );
        }

        if (
          currentBlueprint.isDelete() &&
          tile.hasStaticEntity() &&
          BASE_PARTS.has(tile.getStaticEntity().getAgent().getType())
        ) {
          this.pendingBaseRemovals.splice(
            this.pendingBaseRemovals.indexOf(currentBlueprint),
            1
          );
        }
      }

      const blueprint = new Blueprint(tile, placeable);
      this.surface.spawn(blueprint);
      this.blueprints.set(tile.getHash(), blueprint);

      if (
        placeable.isBasePart &&
        (!tile.hasStaticEntity() ||
          !BASE_PARTS.has(tile.getStaticEntity().getAgent().getType()))
      ) {
        this.pendingBaseAdditions.push(blueprint);
      }
    });

    Manager.Instance.triggerStatUpdate();
    return validTiles;
  }

  private sellBlueprints(selection: Tile[]) {
    const hasBlueprints = selection.find((tile) =>
      this.blueprints.has(tile.getHash())
    );
    let validTiles = selection.filter((tile) => {
      if (hasBlueprints) {
        if (this.blueprints.has(tile.getHash())) {
          return true;
        }

        return false;
      }

      if (
        tile.hasStaticEntity() &&
        placeableEntityTypes.has(tile.getStaticEntity().getAgent().getType())
      ) {
        return true;
      }

      return false;
    });

    const { baseTiles, otherTiles } = this.splitTiles(validTiles);

    if (baseTiles.length) {
      const { pendingBaseAdditions, pendingBaseRemovals } =
        this.getPendingTiles(baseTiles, true);

      if (
        !floodFill(
          pendingBaseRemovals,
          pendingBaseAdditions,
          Manager.Instance.getBase(),
          this.surface
        )
      ) {
        validTiles = otherTiles;

        Manager.Instance.showMessage("Not all base parts can be sold", {
          override: true,
        });
      }
    }

    validTiles.forEach((tile) => {
      if (hasBlueprints) {
        const blueprint = this.blueprints.get(tile.getHash());
        if (blueprint) {
          if (!blueprint.isDelete()) {
            Manager.Instance.sell(blueprint);

            if (
              tile.hasStaticEntity() &&
              BASE_PARTS.has(tile.getStaticEntity().getAgent().getType())
            ) {
              this.pendingBaseRemovals.splice(
                this.pendingBaseRemovals.indexOf(blueprint),
                1
              );
            }
          }

          if (
            blueprint.isBasePart() &&
            (!tile.hasStaticEntity() ||
              !BASE_PARTS.has(tile.getStaticEntity().getAgent().getType()))
          ) {
            this.pendingBaseAdditions.splice(
              this.pendingBaseAdditions.indexOf(blueprint),
              1
            );
          }

          this.blueprints.delete(tile.getHash());
          this.surface.despawn(blueprint);

          if (
            tile.hasStaticEntity() &&
            BASE_PARTS.has(tile.getStaticEntity().getAgent().getType())
          ) {
            this.pendingBaseRemovals.splice(
              this.pendingBaseRemovals.indexOf(blueprint),
              1
            );
          }
        }

        return;
      }

      const blueprint = new Blueprint(tile, this.deletePlaceable);
      this.surface.spawn(blueprint);
      this.blueprints.set(tile.getHash(), blueprint);

      if (BASE_PARTS.has(tile.getStaticEntity()!.getAgent().getType())) {
        this.pendingBaseRemovals.push(blueprint);
      }
    });

    Manager.Instance.triggerStatUpdate();
    return validTiles;
  }

  private placeEntities(selection: Tile[], placeable: Placeable) {
    const validTiles = selection.filter((tile) =>
      this.checkIsFree(tile, placeable.entity!.scale)
    );

    if (
      placeable.isBasePart &&
      !floodFill(
        new Set(),
        new Set(validTiles),
        Manager.Instance.getBase(),
        this.surface
      )
    ) {
      return [];
    }

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
    let validTiles = selection.filter((tile) => {
      if (
        tile.hasStaticEntity() &&
        placeableEntityTypes.has(tile.getStaticEntity().getAgent().getType())
      ) {
        return true;
      }

      return false;
    });

    const { baseTiles, otherTiles } = this.splitTiles(validTiles);

    if (baseTiles.length) {
      const { pendingBaseAdditions, pendingBaseRemovals } =
        this.getPendingTiles(baseTiles, true);

      if (
        !floodFill(
          pendingBaseRemovals,
          pendingBaseAdditions,
          Manager.Instance.getBase(),
          this.surface
        )
      ) {
        validTiles = otherTiles;

        Manager.Instance.showMessage("Not all base parts can be sold", {
          override: true,
        });
      }
    }

    validTiles.forEach((tile) => {
      const agent = tile.getStaticEntity()!.getAgent();
      this.surface.despawnStatic(agent);
      Manager.Instance.sell(agent);
    });

    Manager.Instance.triggerStatUpdate();
    return validTiles;
  }

  private splitTiles(tiles: Tile[]) {
    const baseTiles: Tile[] = [];
    const otherTiles: Tile[] = [];

    tiles.forEach((tile) => {
      const blueprint = this.blueprints.get(tile.getHash());

      if (blueprint && blueprint.isBasePart()) {
        baseTiles.push(tile);
        return;
      }

      if (
        tile.hasStaticEntity() &&
        BASE_PARTS.has(tile.getStaticEntity().getAgent().getType())
      ) {
        baseTiles.push(tile);
      } else {
        otherTiles.push(tile);
      }
    });

    return { baseTiles, otherTiles };
  }

  getPendingTiles(selectedTiles: Tile[], isDelete = false) {
    const pendingBaseAdditions = new Set(
      this.pendingBaseAdditions.map(
        (blueprint) =>
          this.surface.getTile(
            blueprint.entity.getAlignedX(),
            blueprint.entity.getAlignedY()
          )!
      )
    );
    const pendingBaseRemovals = new Set(
      this.pendingBaseRemovals.map(
        (blueprint) =>
          this.surface.getTile(
            blueprint.entity.getAlignedX(),
            blueprint.entity.getAlignedY()
          )!
      )
    );

    let remove = (tile: Tile) => {
      if (pendingBaseAdditions.delete(tile)) {
        return;
      }

      if (pendingBaseRemovals.delete(tile)) {
        return;
      }

      pendingBaseRemovals.add(tile);
    };

    selectedTiles.forEach((tile) => {
      if (isDelete) {
        remove(tile);
        return;
      }

      const blueprint = this.blueprints.get(tile.getHash());
      if (blueprint) {
        if (blueprint.isDelete()) {
          pendingBaseRemovals.delete(tile);
          return;
        }

        pendingBaseAdditions.add(tile);
        return;
      }

      pendingBaseAdditions.add(tile);
    });

    return { pendingBaseAdditions, pendingBaseRemovals };
  }

  private checkIsFree(tile: Tile, scale: number, canOverwrite = false) {
    const tiles = this.surface.getEntityTiles(tile.getX(), tile.getY(), scale);
    return !tiles!.find((tile) => {
      if (!FREE_TILES.has(tile.getBaseType())) {
        return true;
      }

      if (
        tile.hasStaticEntity() &&
        (!canOverwrite ||
          !placeableEntityTypes.has(
            tile.getStaticEntity().getAgent().getType()
          ))
      ) {
        return true;
      }
    });
  }
}

export default BuildController;
