import { GameEvent, SurfaceChange } from "../../events";
import Manager from "../../manager";
import Tile from "../../terrain/tile";
import { IEnemy } from "../enemies";
import { Agent, StaticAgent } from "../entity";
import SpeedBeacon from "../speedBeacon";

export interface ITower extends StaticAgent {
  getCooldown(): number;
  fire(target: IEnemy, dt: number): number;
  getTile(): Tile;
  enable(): void;
  disable(): void;
}

export function isTower(agent: Agent): agent is ITower {
  return "getCooldown" in agent;
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

            tile.addTower(tower);
            coveredTiles.add(tile);

            if (sightLineFn && sightLineFn(tile)) {
              return false;
            }
          },
          true
        );
      },
      true
    );
  };

  run();

  const removeEventListener = Manager.Instance.addEventListener(
    GameEvent.SurfaceChange,
    ({ affectedTiles }: SurfaceChange) => {
      for (const tile of affectedTiles) {
        if (coveredTiles.has(tile)) {
          coveredTiles.forEach((tile) => tile.removeTower(tower));
          coveredTiles.clear();
          run();

          return;
        }
      }
    }
  );

  return () => {
    coveredTiles.forEach((tile) => tile.removeTower(tower));
    removeEventListener();
  };
};

export const getSpeedMultiplier = (linkedAgents: Set<StaticAgent>) => {
  let speedMultiplier = 1;

  linkedAgents.forEach((agent) => {
    if (agent instanceof SpeedBeacon) {
      speedMultiplier += 0.5;
    }
  });

  return speedMultiplier;
};
