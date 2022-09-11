import { GameEvent, SurfaceChange } from "../../events";
import Manager from "../../manager";
import Tile, { TileWithStaticEntity } from "../../terrain/tile";
import DamageBeacon from "../damageBeacon";
import { IEnemy } from "../enemies";
import { Agent } from "../entity";
import SpeedBeacon from "../speedBeacon";
import { StaticAgent } from "../staticEntity";

export interface ITower extends StaticAgent {
  getCooldown(): number;
  fire(target: IEnemy, dt: number): number;
  getTile(): TileWithStaticEntity;
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
  const towerTiles = new Set(surface.getEntityTiles(tower));

  const run = () => {
    surface.forCircle(
      tower.entity.getX() + 1,
      tower.entity.getY() + 1,
      range,
      (target) => {
        surface.forLine(
          tower.entity.getX(),
          tower.entity.getY(),
          target.getX(),
          target.getY(),
          (tile) => {
            tile.addTower(tower);
            coveredTiles.add(tile);

            if (towerTiles.has(tile)) {
              return;
            }

            if (sightLineFn && sightLineFn(tile)) {
              return false;
            }
          },
          {
            connected: true,
          }
        );
      },
      {
        edgeOnly: true,
      }
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

export const getDamageMultiplier = (linkedAgents: Set<StaticAgent>) => {
  let damageMultiplier = 1;

  linkedAgents.forEach((agent) => {
    if (agent instanceof DamageBeacon) {
      damageMultiplier += 0.5;
    }
  });

  return damageMultiplier;
};
