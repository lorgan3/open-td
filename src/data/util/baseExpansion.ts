import Base from "../entity/base";
import Surface from "../terrain/surface";
import Tile from "../terrain/tile";

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
