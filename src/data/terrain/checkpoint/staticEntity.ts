import { Checkpoint, CheckpointFn } from ".";
import { DESTRUCTIBLE_ENTITIES } from "../../entity/constants";
import { IEnemy } from "../../entity/enemies";
import { Agent } from "../../entity/entity";
import Tile from "../tile";

export class StaticEntityCheckpoint implements Checkpoint {
  public readonly isBlocking = true;

  constructor(public index: number) {}

  isCleared(tiles: Tile[]): boolean {
    const tile = tiles[this.index];
    return (
      !tile.hasStaticEntity() ||
      !DESTRUCTIBLE_ENTITIES.has(tile.getStaticEntity().getAgent().getType())
    );
  }

  process(tiles: Tile[], agent: Agent, dt: number): void {
    (agent as IEnemy).AI.attack(
      tiles[this.index].getStaticEntity()!.getAgent()
    );
  }
}

export const staticCheckpointFactory =
  (destructibleEntities = DESTRUCTIBLE_ENTITIES): CheckpointFn =>
  (tiles) => {
    const checkpoints: StaticEntityCheckpoint[] = [];
    tiles.forEach((tile, index) => {
      if (tile.hasStaticEntity()) {
        if (
          destructibleEntities.has(tile.getStaticEntity().getAgent().getType())
        ) {
          checkpoints.push(new StaticEntityCheckpoint(index));
        }
      }
    });

    return checkpoints;
  };
