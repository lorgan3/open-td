import { AgentCategory } from "../entity/entity";
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
        FREE_TILES_INCLUDING_WATER.has(localTile.getBaseType())
      ) {
        if (
          localTile.hasStaticEntity() &&
          localTile.getStaticEntity().getAgent().category !==
            AgentCategory.Player
        ) {
          Manager.Instance.getSurface().despawnStatic(
            localTile.getStaticEntity().getAgent()
          );
        }

        const newTile = new Tile(
          localTile.getX(),
          localTile.getY(),
          TileType.Stone
        );

        tilesToUpdate.push(newTile);
      }
    }
  );
  Manager.Instance.getSurface().setTiles(tilesToUpdate);
};
