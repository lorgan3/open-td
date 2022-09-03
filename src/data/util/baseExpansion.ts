import Base from "../entity/base";
import { StaticAgent } from "../entity/entity";
import Surface from "../terrain/surface";
import Tile, { TileType } from "../terrain/tile";

export const canBuild = (tile: Tile, surface: Surface) => {
  const adjacentTiles = surface.getAdjacentTiles(tile);
  return !!adjacentTiles.find((tile) => tile.getType() === TileType.Base);
};

export const canSell = (target: Tile, base: Base, surface: Surface) => {
  // Perform something like a flood fill to determine whether all base parts are still connected
  // https://en.wikipedia.org/wiki/Flood_fill

  const baseTile = base.getTile();
  const filled = new Set<Tile>([baseTile]);

  const tilesToCheck = surface.getAdjacentTiles(baseTile);
  while (tilesToCheck.length > 0) {
    const tile = tilesToCheck.pop()!;

    if (tile === target || filled.has(tile)) {
      continue;
    }

    if (
      !tile.hasStaticEntity() ||
      !base.getParts().has(tile.getStaticEntity().getAgent() as StaticAgent)
    ) {
      continue;
    }

    filled.add(tile);
    surface.getAdjacentTiles(tile).forEach((tile) => tilesToCheck.push(tile));
  }

  return filled.size === base.getParts().size - 1;
};
