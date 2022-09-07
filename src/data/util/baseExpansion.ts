import Base from "../entity/base";
import { StaticAgent } from "../entity/entity";
import Surface from "../terrain/surface";
import Tile from "../terrain/tile";

const EMPTY_SET = new Set<Tile>();

export const canBuild = (
  tiles: Set<Tile>,
  base: Base,
  surface: Surface,
  pendingRemovedTiles = EMPTY_SET
) => {
  return floodFill(pendingRemovedTiles, tiles, base, surface);
};

export const canSell = (
  tiles: Set<Tile>,
  base: Base,
  surface: Surface,
  pendingAddedTiles = EMPTY_SET
) => {
  return floodFill(tiles, pendingAddedTiles, base, surface);
};

export const floodFill = (
  tilesToSell: Set<Tile>,
  tilesToBuy: Set<Tile>,
  base: Base,
  surface: Surface
) => {
  // Perform something like a flood fill to determine whether all base parts are still connected
  // https://en.wikipedia.org/wiki/Flood_fill

  const baseTile = base.getTile();
  const filled = new Set<Tile>([baseTile]);

  const tilesToCheck = surface.getAdjacentTiles(baseTile);
  while (tilesToCheck.length > 0) {
    const tile = tilesToCheck.pop()!;

    if (tilesToSell.has(tile) || filled.has(tile)) {
      continue;
    }

    if (
      !tilesToBuy.has(tile) &&
      (!tile.hasStaticEntity() ||
        !base.getParts().has(tile.getStaticEntity().getAgent() as StaticAgent))
    ) {
      continue;
    }

    filled.add(tile);
    surface.getAdjacentTiles(tile).forEach((tile) => tilesToCheck.push(tile));
  }

  return (
    filled.size === base.getParts().size + tilesToBuy.size - tilesToSell.size
  );
};
