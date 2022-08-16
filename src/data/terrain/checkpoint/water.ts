import { Checkpoint, CheckpointFn } from ".";
import { Agent } from "../../entity/entity";
import Manager from "../../manager";
import Tile, { TileType } from "../tile";

export class WaterCheckpoint implements Checkpoint {
  constructor(public index: number) {}

  isCleared(tiles: Tile[]): boolean {
    return tiles[this.index].getType() !== TileType.Water;
  }

  process(tiles: Tile[], agent: Agent, dt: number): void {
    const surface = Manager.Instance.getSurface();
    const tile = tiles[this.index];
    const newTiles = [new Tile(tile.getX(), tile.getY(), TileType.Bridge)];

    if (
      agent.entity.getAlignedX() !== tile.getX() &&
      agent.entity.getAlignedY() !== tile.getY()
    ) {
      [
        [1, 0],
        [0, 1],
        [-1, 0],
        [0, -1],
      ].forEach(([x, y]) => {
        const neighbor = surface.getTile(tile.getX() + x, tile.getY() + y);
        if (neighbor?.getType() === TileType.Water) {
          newTiles.push(
            new Tile(neighbor.getX(), neighbor.getY(), TileType.Bridge)
          );
        }
      });
    }

    surface.setTiles(newTiles);
  }
}

export const getWaterCheckpoints: CheckpointFn = (tiles) => {
  const checkpoints: WaterCheckpoint[] = [];
  tiles.forEach((tile, index) => {
    if (tile.getType() === TileType.Water) {
      checkpoints.push(new WaterCheckpoint(index));
    }
  });

  return checkpoints;
};
