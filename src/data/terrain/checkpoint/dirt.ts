import { Checkpoint, CheckpointFn } from ".";
import Enemy from "../../entity/enemies/enemy";
import Manager from "../../manager";
import Tile, { TileType } from "../tile";

const CONVERTIBLE_TILES = new Set([TileType.Grass, TileType.Snow]);

export class DirtCheckpoint implements Checkpoint {
  constructor(public index: number) {}

  isCleared(tiles: Tile[], agent: Enemy): boolean {
    return !CONVERTIBLE_TILES.has(tiles[this.index].getType());
  }

  process(tiles: Tile[], agent: Enemy, dt: number): void {
    const surface = Manager.Instance.getSurface();
    const tile = tiles[this.index];

    if (CONVERTIBLE_TILES.has(tile.getType())) {
      surface.setTile(new Tile(tile.getX(), tile.getY(), TileType.Dirt));
    }
  }
}
// @TODO: would be nice some adjacent grass tiles also turned to dirt.
export const getDirtCheckpoints: CheckpointFn = (tiles) => {
  const checkpoints: DirtCheckpoint[] = [];
  const amount = (Math.random() * tiles.length) / 10;

  const candidates = tiles.filter((tile) =>
    CONVERTIBLE_TILES.has(tile.getType())
  );

  for (let i = 0; i < amount; i++) {
    if (!candidates.length) {
      break;
    }

    const tile = candidates.splice(
      Math.floor(Math.random() * candidates.length),
      1
    )[0];
    checkpoints.push(new DirtCheckpoint(tiles.indexOf(tile)));
  }

  return checkpoints;
};
