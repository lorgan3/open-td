import { DEMOLISH, Placeable, placeableEntityTypes } from "../placeables";
import Manager from "./manager";
import Blueprint from "../entity/blueprint";
import Tile, { TileWithStaticEntity } from "../terrain/tile";
import Surface from "../terrain/surface";
import { ensureBaseIsContinuous } from "../util/floodFill";
import { getScale, StaticAgent } from "../entity/staticEntity";
import { GameEvent } from "../events";
import { EntityType } from "../entity/constants";
import { FREE_TILES, TileType } from "../terrain/constants";
import EventSystem from "../eventSystem";
import MoneyController from "./moneyController";
import UnlocksController from "./unlocksController";
import { ITowerStatics } from "../entity/towers";

class BuildController {
  private static instance: BuildController;
  public static readonly towersPerPart = 2;

  public static readonly baseParts = new Set([
    EntityType.Armory,
    EntityType.Radar,
    EntityType.Market,
    EntityType.PowerPlant,
  ]);

  public static readonly surfacesRequiringFoundation = new Set([
    TileType.Water,
    TileType.Ice,
    TileType.Spore,
    TileType.Bridge,
  ]);

  private blueprints = new Map<string, Blueprint>();

  private pendingBaseAdditions: Blueprint[] = [];
  private pendingBaseRemovals: Blueprint[] = [];

  private freeTiles: Set<TileType>;
  private ignoredEntities: Set<EntityType>;

  constructor(private surface: Surface) {
    BuildController.instance = this;

    this.freeTiles = new Set(FREE_TILES);
    this.ignoredEntities = new Set();

    EventSystem.Instance.addEventListener(GameEvent.Unlock, ({ placeable }) => {
      if (placeable.entityType === EntityType.Excavator) {
        this.freeTiles.add(TileType.Tree);
        this.freeTiles.add(TileType.Rock);

        this.ignoredEntities.add(EntityType.Tree);
        this.ignoredEntities.add(EntityType.Rock);
        this.ignoredEntities.add(EntityType.Stump);
      }

      if (placeable.entityType === EntityType.Terraform) {
        this.freeTiles.add(TileType.Water);
        this.freeTiles.add(TileType.Ice);
        this.freeTiles.add(TileType.Spore);
        this.freeTiles.add(TileType.Bridge);
      }
    });
  }

  getMaxTowers() {
    const partCount = Manager.Instance.getBase().getParts().size;
    return 1 + (partCount + 1) * BuildController.towersPerPart;
  }

  build(selection: Tile[], placeable: Placeable) {
    if (placeable.entityType === EntityType.None) {
      if (Manager.Instance.getIsStarted()) {
        this.sellBlueprints(selection);
      } else {
        this.sellEntities(selection);
      }
      return;
    }

    if (
      !placeableEntityTypes.has(placeable.entityType) ||
      !UnlocksController.Instance.isUnlocked(placeable)
    ) {
      return;
    }

    if (Manager.Instance.getIsStarted()) {
      this.placeBlueprints(selection, placeable);
    } else {
      this.placeEntities(selection, placeable);
    }
  }

  commit() {
    const boughtTiles: Tile[] = [];
    this.blueprints.forEach((blueprint) => {
      const tile = blueprint.getTile();
      const tiles = this.surface.getEntityTiles(
        tile.getX(),
        tile.getY(),
        blueprint.getScale()
      );
      this.surface.despawn(blueprint);

      tiles.forEach((tile) => {
        if (!tile.hasStaticEntity()) {
          return;
        }

        const agent = tile.getStaticEntity().getAgent();
        MoneyController.Instance.sell(agent);
        this.surface.despawnStatic(agent);
      });

      if (blueprint.isDelete()) {
        return;
      }

      const constructor = blueprint.getPlaceable().entity!;
      const agent = new constructor(tile);
      this.spawn(agent);
      MoneyController.Instance.replaceBlueprint(blueprint, agent);
      boughtTiles.push(tile);
    });

    this.pendingBaseAdditions = [];
    this.pendingBaseRemovals = [];

    if (this.blueprints.size === 0) {
      return;
    }

    this.blueprints.clear();
    Manager.Instance.triggerStatUpdate();

    if (boughtTiles.length > 0) {
      EventSystem.Instance.triggerEvent(GameEvent.Buy, {
        tiles: boughtTiles as TileWithStaticEntity[],
      });
    }
  }

  private placeBlueprints(selection: Tile[], placeable: Placeable) {
    const validTiles = selection.filter((tile) =>
      this.checkIsFree(tile, placeable.entity!.scale, true)
    );

    if (placeable.isBasePart) {
      const { pendingBaseAdditions, pendingBaseRemovals } =
        this.getPendingTiles(selection);
      if (
        !ensureBaseIsContinuous(
          pendingBaseRemovals,
          pendingBaseAdditions,
          Manager.Instance.getBase(),
          this.surface
        )
      ) {
        Manager.Instance.showMessage("Not all tiles connect to the base");

        return;
      }
    }

    if (
      validTiles.length === 0 ||
      !Manager.Instance.canBuy(placeable, validTiles.length)
    ) {
      return;
    }

    validTiles.forEach((tile) => {
      const tiles = this.surface.getEntityTiles(
        tile.getX(),
        tile.getY(),
        placeable.entity!.scale
      );
      tiles.forEach((tile) => {
        const currentBlueprint = this.blueprints.get(tile.getHash());
        if (!currentBlueprint) {
          return;
        }

        MoneyController.Instance.sell(currentBlueprint);
        this.freeBlueprint(currentBlueprint);

        if (currentBlueprint.isBasePart()) {
          this.pendingBaseAdditions.splice(
            this.pendingBaseAdditions.indexOf(currentBlueprint),
            1
          );
        } else if (
          tile.hasStaticEntity() &&
          BuildController.baseParts.has(
            tile.getStaticEntity().getAgent().getType()
          )
        ) {
          this.pendingBaseRemovals.splice(
            this.pendingBaseRemovals.indexOf(currentBlueprint),
            1
          );
        }

        if (
          currentBlueprint.isDelete() &&
          tile.hasStaticEntity() &&
          BuildController.baseParts.has(
            tile.getStaticEntity().getAgent().getType()
          )
        ) {
          this.pendingBaseRemovals.splice(
            this.pendingBaseRemovals.indexOf(currentBlueprint),
            1
          );
        }
      });

      const blueprint = new Blueprint(tile, placeable);
      MoneyController.Instance.buy(blueprint);
      this.reserveBlueprint(blueprint);

      if (
        placeable.isBasePart &&
        (!tile.hasStaticEntity() ||
          !BuildController.baseParts.has(
            tile.getStaticEntity().getAgent().getType()
          ))
      ) {
        this.pendingBaseAdditions.push(blueprint);
      }
    });

    Manager.Instance.triggerStatUpdate();
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
        !ensureBaseIsContinuous(
          pendingBaseRemovals,
          pendingBaseAdditions,
          Manager.Instance.getBase(),
          this.surface
        )
      ) {
        validTiles = otherTiles;

        Manager.Instance.showMessage("Not all base parts can be sold");
      }
    }

    if (validTiles.length === 0) {
      return;
    }

    validTiles.forEach((tile) => {
      if (hasBlueprints) {
        const blueprint = this.blueprints.get(tile.getHash());
        if (blueprint) {
          if (!blueprint.isDelete()) {
            MoneyController.Instance.sell(blueprint);

            if (
              tile.hasStaticEntity() &&
              BuildController.baseParts.has(
                tile.getStaticEntity().getAgent().getType()
              )
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
              !BuildController.baseParts.has(
                tile.getStaticEntity().getAgent().getType()
              ))
          ) {
            this.pendingBaseAdditions.splice(
              this.pendingBaseAdditions.indexOf(blueprint),
              1
            );
          }

          this.freeBlueprint(blueprint);

          if (
            tile.hasStaticEntity() &&
            BuildController.baseParts.has(
              tile.getStaticEntity().getAgent().getType()
            )
          ) {
            this.pendingBaseRemovals.splice(
              this.pendingBaseRemovals.indexOf(blueprint),
              1
            );
          }
        }

        return;
      }

      if (tile.hasStaticEntity() && !this.blueprints.get(tile.getHash())) {
        const agent = tile.getStaticEntity().getAgent();

        const blueprint = new Blueprint(
          agent.getTile(),
          DEMOLISH,
          getScale(agent)
        );
        this.reserveBlueprint(blueprint);

        if (BuildController.baseParts.has(agent.getType())) {
          this.pendingBaseRemovals.push(blueprint);
        }
      }
    });

    Manager.Instance.triggerStatUpdate();
  }

  private placeEntities(selection: Tile[], placeable: Placeable) {
    const range = (placeable.entity as unknown as ITowerStatics).range;
    if (range > 1 && this.surface.getTowers().size >= this.getMaxTowers()) {
      Manager.Instance.showMessage(
        "The base needs to be extended to support additional towers"
      );
      return;
    }

    const validTiles = selection.filter((tile) =>
      this.checkIsFree(tile, placeable.entity!.scale)
    );

    if (
      placeable.isBasePart &&
      !ensureBaseIsContinuous(
        new Set(),
        new Set(validTiles),
        Manager.Instance.getBase(),
        this.surface
      )
    ) {
      Manager.Instance.showMessage("Not all tiles connect to the base");
      return;
    }

    if (
      validTiles.length === 0 ||
      !Manager.Instance.canBuy(placeable, validTiles.length)
    ) {
      return;
    }

    validTiles.forEach((tile) => {
      const agent = new placeable.entity!(tile);

      this.surface.getEntityTiles(agent).forEach((tile) => {
        if (tile.hasStaticEntity()) {
          this.surface.despawnStatic(tile.getStaticEntity().getAgent());
        }
      });

      this.spawn(agent);
      MoneyController.Instance.buy(agent);
    });

    Manager.Instance.triggerStatUpdate();
    EventSystem.Instance.triggerEvent(GameEvent.Buy, {
      tiles: validTiles as TileWithStaticEntity[],
    });
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
        !ensureBaseIsContinuous(
          pendingBaseRemovals,
          pendingBaseAdditions,
          Manager.Instance.getBase(),
          this.surface
        )
      ) {
        validTiles = otherTiles;

        Manager.Instance.showMessage("Not all base parts can be sold");
      }
    }

    if (validTiles.length === 0) {
      return;
    }

    validTiles.forEach((tile) => {
      if (tile.hasStaticEntity()) {
        const agent = tile.getStaticEntity().getAgent();
        this.surface.despawnStatic(agent);
        MoneyController.Instance.sell(agent);
      }
    });

    Manager.Instance.triggerStatUpdate();
    EventSystem.Instance.triggerEvent(GameEvent.Sell);
  }

  private splitTiles(tiles: Tile[]) {
    const baseTiles = new Set<Tile>();
    const otherTiles: Tile[] = [];

    tiles.forEach((tile) => {
      const blueprint = this.blueprints.get(tile.getHash());

      if (blueprint && blueprint.isBasePart()) {
        baseTiles.add(blueprint.getTile());
        return;
      }

      if (
        tile.hasStaticEntity() &&
        BuildController.baseParts.has(
          tile.getStaticEntity().getAgent().getType()
        )
      ) {
        baseTiles.add(tile.getStaticEntity().getAgent().getTile());
      } else {
        otherTiles.push(tile);
      }
    });

    return { baseTiles: [...baseTiles], otherTiles };
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
      if (!this.freeTiles.has(tile.getBaseType())) {
        return true;
      }

      if (
        tile.hasStaticEntity() &&
        !this.ignoredEntities.has(tile.getStaticEntity().getAgent().getType())
      ) {
        if (
          !canOverwrite ||
          !placeableEntityTypes.has(tile.getStaticEntity().getAgent().getType())
        ) {
          return true;
        }
      }
    });
  }

  private reserveBlueprint(blueprint: Blueprint) {
    this.surface.spawn(blueprint);

    const tile = blueprint.getTile();
    this.surface
      .getEntityTiles(tile.getX(), tile.getY(), blueprint.getScale())
      .forEach((tile) => this.blueprints.set(tile.getHash(), blueprint));
  }

  private freeBlueprint(blueprint: Blueprint) {
    this.surface.despawn(blueprint);

    const tile = blueprint.getTile();
    this.surface
      .getEntityTiles(tile.getX(), tile.getY(), blueprint.getScale())
      .forEach((tile) => this.blueprints.delete(tile.getHash()));
  }

  private spawn(agent: StaticAgent) {
    this.surface.getEntityTiles(agent).forEach((tile) => {
      if (BuildController.surfacesRequiringFoundation.has(tile.getBaseType())) {
        this.surface.setTile(
          new Tile(tile.getX(), tile.getY(), TileType.Stone)
        );
      }
    });

    this.surface.spawnStatic(agent);
  }

  static get Instance() {
    return this.instance;
  }
}

export default BuildController;
