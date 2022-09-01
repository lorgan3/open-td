import Base from "../entity/base";
import { StaticAgent } from "../entity/entity";
import Surface from "../terrain/surface";
import Tile, { TileType } from "../terrain/tile";

const getAdjacentTiles = (tile: Tile, surface: Surface) => {
  const options: Array<[number, number]> = [
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
  ];

  return options
    .map(([x, y]) => surface.getTile(tile.getX() + x, tile.getY() + y))
    .filter((tile) => !!tile && tile.hasStaticEntity()) as Tile[];
};

export const canBuild = (tile: Tile, surface: Surface) => {
  const adjacentTiles = getAdjacentTiles(tile, surface);
  return !!adjacentTiles.find((tile) => tile.getType() === TileType.Base);
};

export const canSell = (target: Tile, base: Base, surface: Surface) => {
  // Perform something like a flood fill to determine whether all base parts are still connected
  // https://en.wikipedia.org/wiki/Flood_fill

  const baseTile = base.getTile();
  const filled = new Set<Tile>([baseTile]);

  const tilesToCheck = getAdjacentTiles(baseTile, surface);
  while (tilesToCheck.length > 0) {
    const tile = tilesToCheck.pop()!;

    if (
      tile === target ||
      filled.has(tile) ||
      !base.getParts().has(tile.getStaticEntity()!.getAgent() as StaticAgent)
    ) {
      continue;
    }

    filled.add(tile);
    getAdjacentTiles(tile, surface).forEach((tile) => tilesToCheck.push(tile));
  }

  return filled.size === base.getParts().size - 1;
};
