import { Checkpoint, CheckpointFn } from ".";
import Manager from "../../controllers/manager";
import { DESTRUCTIBLE_ENTITIES } from "../../entity/constants";
import { IEnemy } from "../../entity/enemies";
import Tile from "../tile";

export class StaticEntityCheckpoint implements Checkpoint {
  public readonly isBlocking = true;

  constructor(public index: number) {}

  isCleared(tiles: Tile[], agent: IEnemy): boolean {
    const tile = tiles[this.index];

    if (agent.getScale() === 1) {
      return (
        !tile.hasStaticEntity() ||
        !DESTRUCTIBLE_ENTITIES.has(tile.getStaticEntity().getAgent().getType())
      );
    }

    return !Manager.Instance.getSurface()
      .getEntityTiles(tile.getX(), tile.getY(), agent.getScale())
      .some(
        (tile) =>
          tile.hasStaticEntity() &&
          DESTRUCTIBLE_ENTITIES.has(tile.getStaticEntity().getAgent().getType())
      );
  }

  process(tiles: Tile[], agent: IEnemy, dt: number): void {
    if (agent.getScale() === 1) {
      (agent as IEnemy).AI.attack(
        tiles[this.index].getStaticEntity()!.getAgent()
      );
      return;
    }

    const subTiles = Manager.Instance.getSurface().getEntityTiles(
      tiles[this.index].getX(),
      tiles[this.index].getY(),
      agent.getScale()
    );

    for (let tile of subTiles) {
      if (
        !tile.hasStaticEntity() ||
        !DESTRUCTIBLE_ENTITIES.has(tile.getStaticEntity().getAgent().getType())
      ) {
        continue;
      }

      (agent as IEnemy).AI.attack(tile.getStaticEntity()!.getAgent());
      return;
    }
  }
}

export const staticCheckpointFactory =
  (scale = 1, destructibleEntities = DESTRUCTIBLE_ENTITIES): CheckpointFn =>
  (tiles) => {
    const surface = Manager.Instance.getSurface();
    const checkpoints: StaticEntityCheckpoint[] = [];

    for (let i = 0; i < tiles.length; i++) {
      const subTiles = surface.getEntityTiles(
        tiles[i].getX(),
        tiles[i].getY(),
        scale
      );

      for (let tile of subTiles) {
        if (tile.hasStaticEntity()) {
          if (
            destructibleEntities.has(
              tile.getStaticEntity().getAgent().getType()
            )
          ) {
            checkpoints.push(new StaticEntityCheckpoint(i));
            break;
          }
        }
      }
    }

    return checkpoints;
  };
