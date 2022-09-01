import { Checkpoint, CheckpointFn } from ".";
import { IEnemy } from "../../entity/enemies";
import { Agent, DESTRUCTIBLE_ENTITIES } from "../../entity/entity";
import Tile from "../tile";

export class StaticEntityCheckpoint implements Checkpoint {
  constructor(public index: number) {}

  isCleared(tiles: Tile[]): boolean {
    return !tiles[this.index].hasStaticEntity();
  }

  process(tiles: Tile[], agent: Agent, dt: number): void {
    (agent as IEnemy).attack(
      tiles[this.index].getStaticEntity()!.getAgent(),
      dt
    );
  }
}

export const getStaticEntityCheckpoints: CheckpointFn = (tiles) => {
  const checkpoints: StaticEntityCheckpoint[] = [];
  tiles.forEach((tile, index) => {
    if (tile.hasStaticEntity()) {
      if (
        DESTRUCTIBLE_ENTITIES.has(tile.getStaticEntity().getAgent().getType())
      ) {
        checkpoints.push(new StaticEntityCheckpoint(index));
      }
    }
  });

  return checkpoints;
};
