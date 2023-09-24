import Base from "../entity/base";
import { AgentCategory } from "../entity/constants";
import { IEnemyStatics } from "../entity/enemies";
import Bore from "../entity/enemies/bore";
import { DiscoveryMethod, GameEvent, SurfaceChange } from "../events";
import EventSystem from "../eventSystem";
import {
  DiscoveryStatus,
  FREE_TILES,
  FREE_TILES_INCLUDING_WATER,
  TileType,
} from "../terrain/constants";
import Surface from "../terrain/surface";
import Tile from "../terrain/tile";
import SpawnAlert from "../util/spawnAlert";
import SpawnGroup, { SpawnGroupData } from "../wave/spawnGroup";
import { normalDistributionRandom } from "../wave/util";
import Wave from "../wave/wave";
import Manager from "./manager";
import VisibilityController from "./visibilityController";

export interface WaveControllerData {
  spawnGroups: SpawnGroupData[];
  nextSpawnGroup: SpawnGroupData | null;
  direction: number;
  timeSinceLastExpansion: number;
}

class WaveController {
  private static instance: WaveController;

  private spawnGroups: SpawnGroup[] = [];
  private nextSpawnGroup: SpawnGroup | undefined;
  private initialNextSpawnGroup: SpawnGroup | undefined;
  private direction = Math.random() * Math.PI * 2;
  private nextUnit?: IEnemyStatics;

  private wave?: Wave;
  private timeSinceLastExpansion = 0;

  private removeSurfaceChangeEventListener: () => void;

  constructor(private base: Base, private surface: Surface) {
    if (WaveController.instance) {
      WaveController.instance.removeSurfaceChangeEventListener();
    }

    WaveController.instance = this;

    this.removeSurfaceChangeEventListener =
      EventSystem.Instance.addEventListener(
        GameEvent.SurfaceChange,
        this.onSurfaceChange
      );
  }

  tick(dt: number) {
    if (!this.wave) {
      return;
    }

    this.wave.tick(dt);
  }

  startNewWave() {
    const level = Manager.Instance.getLevel();
    if (VisibilityController.Instance.hasPendingAgents()) {
      this.timeSinceLastExpansion = 0;
    }

    this.spawnGroups.forEach((spawnGroup) => {
      spawnGroup.grow();
      spawnGroup.rePath();
    });

    const spawnGroups: SpawnGroup[] = [];
    const nextSpawnGroup = this.getNextSpawnGroup();
    if (nextSpawnGroup) {
      spawnGroups.push(nextSpawnGroup);
    }

    // This means the initial next spawn group was discovered. In this case we still want to award a wave point.
    if (nextSpawnGroup !== this.initialNextSpawnGroup) {
      spawnGroups.push(this.initialNextSpawnGroup!);
    }

    spawnGroups.forEach((spawnGroup) => {
      this.timeSinceLastExpansion = 0;

      const [x, y] = spawnGroup.getCenter();
      const tilesToUpdate: Tile[] = [];
      this.surface.forCircle(x, y, SpawnGroup.size, (tile) => {
        if (FREE_TILES_INCLUDING_WATER.has(tile.getType())) {
          tilesToUpdate.push(
            new Tile(tile.getX(), tile.getY(), TileType.Spore)
          );

          if (tile.hasStaticEntity()) {
            this.surface.despawnStatic(tile.getStaticEntity().getAgent());
          }
        }
      });
      this.surface.setTiles(tilesToUpdate);

      this.spawnGroups.push(spawnGroup);
    });

    this.cleanupSpawnGroups(DiscoveryMethod.Radar);

    this.nextUnit = undefined;
    this.nextSpawnGroup = undefined;
    this.initialNextSpawnGroup = undefined;
    this.wave = Wave.fromSpawnGroups(
      level,
      level === 9 ? [this.spawnGroups[0]] : [...this.spawnGroups]
    );
  }

  processWave() {
    if (this.isWaveInProgress()) {
      return false;
    }

    this.timeSinceLastExpansion++;

    this.spawnGroups.forEach((spawnGroup) =>
      spawnGroup.setUnit(Wave.getUnitForLevel(Manager.Instance.getLevel()))
    );

    return true;
  }

  cleanupSpawnGroups(method: DiscoveryMethod) {
    for (let i = this.spawnGroups.length - 1; i >= 0; i--) {
      const spawnGroup = this.spawnGroups[i];

      if (spawnGroup.isExposed() > 0) {
        // Clean up exposed spawn locations
        this.spawnGroups.splice(i, 1);
        VisibilityController.Instance.uncoverSpawnGroup(spawnGroup, method);
      }
    }
  }

  getWave() {
    return this.wave;
  }

  getSpawnGroups() {
    const activeSpawnGroups = this.spawnGroups.filter(
      (spawnGroup) => spawnGroup.isExposed() === 0
    );

    if (!this.isWaveInProgress()) {
      const nextSpawnGroup = this.getNextSpawnGroup();
      if (nextSpawnGroup) {
        activeSpawnGroups.push(nextSpawnGroup);
      }
    }

    if (Manager.Instance.getLevel() === 9 + (this.isWaveInProgress() ? 1 : 0)) {
      return [activeSpawnGroups[0]];
    }

    return activeSpawnGroups;
  }

  getSpawnAlertRanges() {
    return SpawnAlert.forSpawnGroups(this.getSpawnGroups());
  }

  isWaveInProgress() {
    if (this.wave && !this.wave.isDone()) {
      return true;
    }

    const remainingEnemies = this.surface.getEntitiesForCategory(
      AgentCategory.Enemy
    ).size;

    return remainingEnemies > 0;
  }

  shouldAddSpawnGroup() {
    if (this.initialNextSpawnGroup && !this.initialNextSpawnGroup.isExposed()) {
      return true;
    }

    const timeToExpansion = Math.ceil(2 ** this.spawnGroups.length / 3);
    const time = VisibilityController.Instance.hasPendingAgents()
      ? 0
      : this.timeSinceLastExpansion;

    const shouldHaveNextSpawnGroup =
      this.spawnGroups.filter((spawnGroup) => spawnGroup.isExposed() === 0)
        .length === 0 || time >= timeToExpansion;

    return shouldHaveNextSpawnGroup;
  }

  serialize(): WaveControllerData {
    return {
      spawnGroups: this.spawnGroups.map((spawnGroup) => spawnGroup.serialize()),
      nextSpawnGroup: this.nextSpawnGroup
        ? this.nextSpawnGroup.serialize()
        : null,
      direction: this.direction,
      timeSinceLastExpansion: this.timeSinceLastExpansion,
    };
  }

  static deserialize(surface: Surface, base: Base, data: WaveControllerData) {
    const waveController = new WaveController(base, surface);

    waveController.spawnGroups = data.spawnGroups.map((spawnGroup) =>
      SpawnGroup.deserialize(surface, base.getTile(), spawnGroup)
    );

    if (data.nextSpawnGroup) {
      waveController.nextSpawnGroup = SpawnGroup.deserialize(
        surface,
        base.getTile(),
        data.nextSpawnGroup
      );
      waveController.initialNextSpawnGroup = waveController.nextSpawnGroup;
    }

    waveController.direction = data.direction;
    waveController.timeSinceLastExpansion = data.timeSinceLastExpansion;

    return waveController;
  }

  private getNextSpawnGroup() {
    if (!this.shouldAddSpawnGroup()) {
      return;
    }

    if (this.nextSpawnGroup && !this.nextSpawnGroup.isExposed()) {
      return this.nextSpawnGroup;
    }

    if (this.initialNextSpawnGroup && !this.initialNextSpawnGroup.isExposed()) {
      this.nextSpawnGroup = this.initialNextSpawnGroup;
      return this.nextSpawnGroup;
    }

    const level = Manager.Instance.getLevel();
    if (!this.nextUnit) {
      this.nextUnit = Wave.getUnitForLevel(level);
    }

    if (this.nextUnit === Bore) {
      this.direction = this.surface.getTowerDirection(this.base.getTile());
    } else {
      this.direction +=
        (Math.random() > 0.5 ? 1 : -1) *
        Math.max(
          (Math.PI / 6) *
            normalDistributionRandom() *
            Math.min(Math.PI * 2, level + 1)
        );
    }

    let spawned = false;
    let backOff = 3;
    for (let i = 0; i < 20; i++) {
      this.surface.forRay(
        this.base.getTile().getX(),
        this.base.getTile().getY(),
        this.direction,
        (tile) => {
          if (tile.getDiscoveryStatus() !== DiscoveryStatus.Undiscovered) {
            backOff =
              4 +
              Math.min(
                Manager.Instance.getLevel() / 2,
                Math.floor(Math.random() * 6)
              );

            return true;
          }

          backOff--;

          if (backOff > 0) {
            return true;
          }

          if (
            Math.random() > 0.66
              ? !FREE_TILES_INCLUDING_WATER.has(tile.getType())
              : !FREE_TILES.has(tile.getType())
          ) {
            // For the first 10 attempts in the first wave, try putting the spawn point as close as possible.
            return !(Manager.Instance.getLevel() === 0 && i < 10);
          }

          this.nextSpawnGroup = SpawnGroup.fromTiles(
            [tile, tile, tile, tile],
            this.base.getTile(),
            this.surface
          );
          this.nextSpawnGroup.setUnit(this.nextUnit!);

          spawned = true;
          return false;
        }
      );

      if (!spawned) {
        this.direction += Math.PI / 10;
      } else {
        break;
      }
    }

    if (!this.initialNextSpawnGroup) {
      this.initialNextSpawnGroup = this.nextSpawnGroup;
    }

    return this.nextSpawnGroup;
  }

  private onSurfaceChange = ({
    affectedTiles,
    removedStaticAgents,
  }: SurfaceChange) => {
    const inProgress = this.isWaveInProgress();

    this.spawnGroups.forEach((spawnGroup) => {
      if (inProgress) {
        spawnGroup.getSpawnPoints().forEach((path) => {
          if (path.isAffectedByTiles(affectedTiles)) {
            path.recompute();
          }
        });
      } else {
        // If an agent was removed a better route may be available
        const shouldRePath =
          removedStaticAgents.size > 0 ||
          !!spawnGroup
            .getSpawnPoints()
            .find((path) => path.isAffectedByTiles(affectedTiles));

        if (!!shouldRePath) {
          spawnGroup.rePath();
        }
      }
    });

    const nextSpawnGroup = this.getNextSpawnGroup();
    if (!inProgress && nextSpawnGroup) {
      // If an agent was removed a better route may be available
      const shouldRePath =
        removedStaticAgents.size > 0 ||
        !!nextSpawnGroup
          .getSpawnPoints()
          .find((path) => path.isAffectedByTiles(affectedTiles));

      if (shouldRePath) {
        nextSpawnGroup!.rePath();
      }
    }
  };

  static get Instance() {
    return this.instance;
  }
}

export default WaveController;
