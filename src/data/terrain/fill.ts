import { getScale, StaticAgent } from "../entity/staticEntity";
import Manager from "../controllers/manager";
import Tile from "./tile";
import { AgentCategory } from "../entity/constants";
import { FREE_TILES_INCLUDING_WATER, TileType } from "./constants";

export const createStoneSurface = (agent: StaticAgent, radius: number) => {
  const tilesToUpdate: Tile[] = [];
  const scale = getScale(agent);
  const offset = scale === 2 ? 1 : 0;

  Manager.Instance.getSurface().forCircle(
    agent.getTile().getX() + offset,
    agent.getTile().getY() + offset,
    radius * scale,
    (localTile) => {
      if (FREE_TILES_INCLUDING_WATER.has(localTile.getBaseType())) {
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
