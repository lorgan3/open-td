import Base from "../entity/base";
import { EntityType } from "../entity/constants";
import Surface from "../terrain/surface";
import Tile from "../terrain/tile";

export const ensureBaseIsContinuous = (
  tilesToSell: Set<Tile>,
  tilesToBuy: Set<Tile>,
  base: Base,
  surface: Surface
) => {
  // Perform something like a flood fill to determine whether all base parts are still connected
  // https://en.wikipedia.org/wiki/Flood_fill

  const baseTile = base.getTile();
  const filled = new Set<Tile>([baseTile]);

  const tilesToCheck = surface.getAdjacentTiles(baseTile, 2);
  while (tilesToCheck.length > 0) {
    const tile = tilesToCheck.pop()!;

    if (tilesToSell.has(tile) || filled.has(tile)) {
      continue;
    }

    if (
      !tilesToBuy.has(tile) &&
      (!tile.hasStaticEntity() ||
        !base.getParts().has(tile.getStaticEntity().getAgent()))
    ) {
      continue;
    }

    filled.add(tile);
    surface
      .getAdjacentTiles(tile, 2)
      .forEach((tile) => tilesToCheck.push(tile));
  }

  return (
    filled.size === base.getParts().size + tilesToBuy.size - tilesToSell.size
  );
};

export const getStructureSize = (
  source: Tile,
  surface: Surface,
  entityTypes: Set<EntityType>,
  includeDiagonals = false
) => {
  const filled = new Set<Tile>([source]);

  const tilesToCheck = surface.getAdjacentTiles(source, 2, includeDiagonals);
  while (tilesToCheck.length > 0) {
    const tile = tilesToCheck.pop()!;

    if (filled.has(tile)) {
      continue;
    }

    if (
      !tile.hasStaticEntity() ||
      !entityTypes.has(tile.getStaticEntity().getAgent().getType())
    ) {
      continue;
    }

    filled.add(tile);
    surface
      .getAdjacentTiles(tile, 2, includeDiagonals)
      .forEach((tile) => tilesToCheck.push(tile));
  }

  return filled.size;
};
