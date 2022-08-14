import { Checkpoint, CheckpointFn } from ".";
import { IEnemy } from "../../entity/enemies";
import { Agent, DESTRUCTIBLE_ENTITIES } from "../../entity/entity";
import Tile from "../tile";

class StaticEntityCheckpoint implements Checkpoint {
  constructor(public index: number, public tile: Tile) {}

  isCleared(): boolean {
    return !this.tile.hasStaticEntity();
  }

  process(agent: Agent, dt: number): void {
    (agent as IEnemy).attack(this.tile.getStaticEntity()!.getAgent(), dt);
  }
}

export const getStaticEntityCheckpoints: CheckpointFn = (tiles) => {
  const checkpoints: StaticEntityCheckpoint[] = [];
  tiles.forEach((tile, index) => {
    if (tile.hasStaticEntity()) {
      if (
        DESTRUCTIBLE_ENTITIES.has(tile.getStaticEntity()!.getAgent().getType())
      ) {
        checkpoints.push(new StaticEntityCheckpoint(index, tile));
      }
    }
  });

  return checkpoints;
};
