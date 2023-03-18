import { Checkpoint, CheckpointFn } from ".";
import Manager from "../../controllers/manager";
import { EntityType } from "../../entity/constants";
import { IEnemy } from "../../entity/enemies";
import Tile from "../tile";

export class TreeCheckpoint implements Checkpoint {
  public readonly isBlocking = false;

  constructor(public index: number) {}

  isCleared(tiles: Tile[], agent: IEnemy): boolean {
    const tile = tiles[this.index];

    return !Manager.Instance.getSurface()
      .getEntityTiles(tile.getX(), tile.getY(), agent.getScale())
      .some(
        (tile) =>
          tile.hasStaticEntity() &&
          tile.getStaticEntity().getAgent().getType() === EntityType.Tree
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
        tile.getStaticEntity().getAgent().getType() === EntityType.Tree
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
        tile.getStaticEntity().getAgent().getType() === EntityType.Tree
      ) {
        checkpoints.push(new TreeCheckpoint(i));
        break;
      }
    }
  }

  return checkpoints;
};
