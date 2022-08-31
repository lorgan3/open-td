import Manager from "../manager";
import Tile, { FREE_TILES_INCLUDING_WATER, TileType } from "./tile";

export const createStoneSurface = (tile: Tile, radius: number) => {
  const tilesToUpdate: Tile[] = [];
  Manager.Instance.getSurface().forCircle(
    tile.getX(),
    tile.getY(),
    radius,
    (localTile) => {
      if (
        localTile !== tile &&
        FREE_TILES_INCLUDING_WATER.has(localTile.getType())
      ) {
        tilesToUpdate.push(
          new Tile(localTile.getX(), localTile.getY(), TileType.Stone)
        );
      }
    }
  );
  Manager.Instance.getSurface().setTiles(tilesToUpdate);
};
