import { GameEvent, SurfaceChange } from "../../events";
import Manager from "../../manager";
import Tile from "../../terrain/tile";
import { IEnemy } from "../enemies";
import { Agent } from "../entity";

export interface ITower extends Agent {
  getCooldown(): number;
  fire(target: IEnemy): number;
  despawn(): void;
}

export const coverTilesWithTowerSightLines = (
  tower: ITower,
  range: number,
  sightLineFn?: (tile: Tile) => boolean
) => {
  const surface = Manager.Instance.getSurface();
  const coveredTiles = new Set<Tile>();

  const run = () => {
    surface.forCircle(
      tower.entity.getX(),
      tower.entity.getY(),
      range,
      (target) => {
        surface.forLine(
          tower.entity.getX(),
          tower.entity.getY(),
          target.getX(),
          target.getY(),
          (tile, index) => {
            if (index === 0) {
              return;
            }

            if (sightLineFn && sightLineFn(tile)) {
              return false;
            }

            tile.addTower(tower);
            coveredTiles.add(tile);
          },
          true
        );
      },
      true
    );
  };

  run();
  const update = ({ affectedTiles }: SurfaceChange) => {
    for (const tile of affectedTiles) {
      if (coveredTiles.has(tile)) {
        coveredTiles.forEach((tile) => tile.removeTower(tower));
        coveredTiles.clear();
        run();

        return;
      }
    }
  };

  Manager.Instance.addEventListener(GameEvent.SurfaceChange, update);

  return () => {
    coveredTiles.forEach((tile) => tile.removeTower(tower));
    Manager.Instance.removeEventListener(GameEvent.SurfaceChange, update);
  };
};
