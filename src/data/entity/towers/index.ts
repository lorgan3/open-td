import Manager from "../../manager";
import Tile from "../../terrain/tile";
import { IEnemy } from "../enemies";
import { Agent } from "../entity";

export interface ITower extends Agent {
  getCooldown(): number;
  fire(target: IEnemy): number;
}

export const coverTilesWithTowerSightLines = (
  tower: ITower,
  range: number,
  sightLineFn?: (tile: Tile) => boolean
) => {
  const surface = Manager.Instance.getSurface();
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
        },
        true
      );
    },
    true
  );
};
