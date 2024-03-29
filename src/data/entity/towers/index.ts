import { GameEvent, SurfaceChange } from "../../events";
import Manager from "../../controllers/manager";
import Tile, { TileWithStaticEntity } from "../../terrain/tile";
import DamageBeacon from "../damageBeacon";
import { IEnemy } from "../enemies";
import { Agent } from "../entity";
import SpeedBeacon from "../speedBeacon";
import { StaticAgent, StaticAgentStatics } from "../staticEntity";
import EventSystem from "../../eventSystem";

export interface ITower extends StaticAgent {
  getCooldown(): number;
  fire(target: IEnemy, dt: number): number;
  getTile(): TileWithStaticEntity;
  enable(): void;
  disable(): void;
  isSpeedBoosted(): boolean;
  isDamageBoosted(): boolean;
}

export interface ITowerStatics extends StaticAgentStatics {
  readonly range: number;
}

export function isTower(agent: Agent): agent is ITower {
  return "getCooldown" in agent;
}

export const getRange = (tower: ITower) => {
  return (tower.constructor as unknown as ITowerStatics).range;
};

export const coverTilesWithTowerSightLines = (
  tower: ITower,
  range: number,
  sightLineFn?: (tile: Tile) => boolean
): [() => void, Set<Tile>] => {
  const surface = Manager.Instance.getSurface();
  const coveredTiles = new Set<Tile>();

  const run = () => {
    const towerTiles = surface.getEntityTiles(tower);
    const towerTilesSet = new Set(towerTiles);

    surface.forCircle(
      tower.entity.getX() + 1,
      tower.entity.getY() + 1,
      range,
      (target) => {
        let source: Tile;
        if (target.getX() <= tower.entity.getAlignedX()) {
          if (target.getY() <= tower.entity.getAlignedY()) {
            source = towerTiles[0];
          } else {
            source = towerTiles[2];
          }
        } else {
          if (target.getY() <= tower.entity.getAlignedY()) {
            source = towerTiles[1];
          } else {
            source = towerTiles[3];
          }
        }

        surface.forLine(
          source.getX(),
          source.getY(),
          target.getX(),
          target.getY(),
          (tile) => {
            tile.addTower(tower);
            coveredTiles.add(tile);

            if (towerTilesSet.has(tile)) {
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

  let firstRun = true;
  const removeEventListener = EventSystem.Instance.addEventListener(
    GameEvent.SurfaceChange,
    ({ affectedTiles }: SurfaceChange) => {
      if (firstRun) {
        firstRun = false;
        run();
        return;
      }

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

  return [
    () => {
      coveredTiles.forEach((tile) => tile.removeTower(tower));
      removeEventListener();
    },
    coveredTiles,
  ];
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
