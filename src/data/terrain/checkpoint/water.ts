import { Checkpoint, CheckpointFn } from ".";
import Enemy from "../../entity/enemies/enemy";
import Manager from "../../manager";
import Tile, { TileType } from "../tile";

export class WaterCheckpoint implements Checkpoint {
  constructor(public index: number) {}

  isCleared(tiles: Tile[], agent: Enemy): boolean {
    return !this.getTiles(tiles[this.index], agent).length;
  }

  process(tiles: Tile[], agent: Enemy, dt: number): void {
    const surface = Manager.Instance.getSurface();
    const tile = tiles[this.index];
    const targets = this.getTiles(tile, agent);

    if (targets.length > 0) {
      const target = targets[0];
      agent.entity.lookAt(target);
      agent.interact(() => {
        if (
          surface.getTile(target.getX(), target.getY())!.getType() ===
          TileType.Water
        ) {
          surface.setTile(
            new Tile(target.getX(), target.getY(), TileType.Bridge)
          );
        }
      });
    }
  }

  private getTiles(middleTile: Tile, agent: Enemy) {
    const surface = Manager.Instance.getSurface();
    const tiles: Tile[] = [];

    if (!agent.canBuild) {
      return tiles;
    }

    if (middleTile.getType() === TileType.Water) {
      tiles.push(middleTile);
    }

    if (
      agent.entity.getAlignedX() !== middleTile.getX() &&
      agent.entity.getAlignedY() !== middleTile.getY()
    ) {
      [
        [agent.entity.getAlignedX(), middleTile.getY()],
        [middleTile.getX(), agent.entity.getAlignedY()],
      ].forEach(([x, y]) => {
        const neighbor = surface.getTile(x, y);
        if (neighbor?.getType() === TileType.Water) {
          tiles.push(neighbor);
        }
      });
    }

    return tiles;
  }
}

export const getWaterCheckpoints: CheckpointFn = (tiles) => {
  const checkpoints: WaterCheckpoint[] = [];

  for (let i = 0; i < tiles.length; i++) {
    if (tiles[i].getType() === TileType.Water) {
      checkpoints.push(new WaterCheckpoint(i));

      // Also checkpoint the next tile to complete the edges of the bridge if necessary
      if (i < tiles.length && tiles[i + 1].getType() !== TileType.Water) {
        checkpoints.push(new WaterCheckpoint(i + 1));
      }
    }
  }

  tiles.forEach((tile, index) => {});

  return checkpoints;
};
