import { Checkpoint, CheckpointFn } from ".";
import { IEnemy } from "../../entity/enemies";
import Manager from "../../controllers/manager";
import Tile from "../tile";
import { TileType } from "../constants";

const CONVERTIBLE_TILES = new Set([TileType.Grass, TileType.Snow]);

export class DirtCheckpoint implements Checkpoint {
  public readonly isBlocking = false;

  constructor(public index: number) {}

  isCleared(tiles: Tile[], agent: IEnemy): boolean {
    if (agent.getScale() === 1) {
      return !CONVERTIBLE_TILES.has(tiles[this.index - 1].getType());
    }

    return Manager.Instance.getSurface()
      .getEntityTiles(
        tiles[this.index - 1].getX(),
        tiles[this.index - 1].getY(),
        agent.getScale()
      )
      .every((subTile) => !CONVERTIBLE_TILES.has(subTile.getType()));
  }

  process(tiles: Tile[], agent: IEnemy, dt: number): void {
    const surface = Manager.Instance.getSurface();
    const tile = tiles[this.index - 1];

    const subTiles = Manager.Instance.getSurface().getEntityTiles(
      tile.getX(),
      tile.getY(),
      agent.getScale()
    );

    for (let subTile of subTiles) {
      if (CONVERTIBLE_TILES.has(subTile.getType())) {
        surface.setTile(
          new Tile(subTile.getX(), subTile.getY(), TileType.Dirt)
        );
      }
    }
  }
}

// @TODO: would be nice some adjacent grass tiles also turned to dirt.
export const dirtCheckpointFactory =
  (scale = 1): CheckpointFn =>
  (tiles) => {
    const checkpoints: DirtCheckpoint[] = [];

    if (scale > 1) {
      const surface = Manager.Instance.getSurface();
      tiles.forEach((tile, i) => {
        const subTiles = surface.getEntityTiles(
          tile.getX(),
          tile.getY(),
          scale
        );

        if (
          subTiles.some((subTile) =>
            CONVERTIBLE_TILES.has(subTile.getBaseType())
          )
        ) {
          checkpoints.push(new DirtCheckpoint(i + 1));
        }
      });

      return checkpoints;
    }

    const amount = (Math.random() * tiles.length) / 10;

    const candidates = tiles.filter((tile) =>
      CONVERTIBLE_TILES.has(tile.getBaseType())
    );

    for (let i = 0; i < amount; i++) {
      if (!candidates.length) {
        break;
      }

      const tile = candidates.splice(
        Math.floor(Math.random() * candidates.length),
        1
      )[0];
      checkpoints.push(new DirtCheckpoint(tiles.indexOf(tile) + 1));
    }

    return checkpoints;
  };
