import { Checkpoint, CheckpointFn } from ".";
import Manager from "../../controllers/manager";
import { EntityType } from "../../entity/constants";
import { IEnemy } from "../../entity/enemies";
import Tile from "../tile";

export class TreeCheckpoint implements Checkpoint {
  public readonly isBlocking = false;

  public static treeTypes = new Set([
    EntityType.Tree,
    EntityType.Pine,
    EntityType.Cactus,
  ]);

  constructor(public index: number) {}

  isCleared(tiles: Tile[], agent: IEnemy): boolean {
    const tile = tiles[this.index];

    return !Manager.Instance.getSurface()
      .getEntityTiles(tile.getX(), tile.getY(), agent.getScale())
      .some(
        (tile) =>
          tile.hasStaticEntity() &&
          TreeCheckpoint.treeTypes.has(
            tile.getStaticEntity().getAgent().getType()
          )
      );
  }

  process(tiles: Tile[], agent: IEnemy, dt: number): void {
    const subTiles = Manager.Instance.getSurface().getEntityTiles(
      tiles[this.index].getX(),
      tiles[this.index].getY(),
      2
    );

    for (let tile of subTiles) {
      if (
        tile.hasStaticEntity() &&
        TreeCheckpoint.treeTypes.has(
          tile.getStaticEntity().getAgent().getType()
        )
      ) {
        tile.getStaticEntity().getAgent().hit!(100);
      }
    }
  }
}

export const getTreeCheckpoints: CheckpointFn = (tiles) => {
  const surface = Manager.Instance.getSurface();
  const checkpoints: TreeCheckpoint[] = [];

  for (let i = 0; i < tiles.length; i++) {
    const subTiles = surface.getEntityTiles(
      tiles[i].getX(),
      tiles[i].getY(),
      2
    );

    for (let tile of subTiles) {
      if (
        tile.hasStaticEntity() &&
        TreeCheckpoint.treeTypes.has(
          tile.getStaticEntity().getAgent().getType()
        )
      ) {
        checkpoints.push(new TreeCheckpoint(i));
        break;
      }
    }
  }

  return checkpoints;
};
