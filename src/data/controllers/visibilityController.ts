import type Base from "../entity/base";
import { Agent } from "../entity/entity";
import Surface from "../terrain/surface";
import Tile from "../terrain/tile";
import { DiscoveryStatus, TileType } from "../terrain/constants";
import { EntityType } from "../entity/constants";
import Manager from "./manager";
import EventSystem from "../eventSystem";
import { DiscoveryMethod, GameEvent } from "../events";
import SpawnGroup, { SpawnGroupData } from "../wave/spawnGroup";
import WaveController from "./waveController";
import { StaticAgent } from "../entity/staticEntity";

export interface VisibilityControllerData {
  tiles: Array<{
    x: number;
    y: number;
    edge: [number, number];
  }>;
  discoveredSpawnGroups: SpawnGroupData[];
}

const isBase = (agent: Agent): agent is Base => {
  return agent.getType() === EntityType.Base;
};

class VisibilityController {
  private static instance: VisibilityController;

  private discoveredSpawnGroups = new Set<SpawnGroup>();
  private agents = new Set<StaticAgent>();
  private edgeMap = new Map<number, [number, number]>();
  private pendingAgents = new Set<StaticAgent>();
  private base?: Base;
  private pendingRadius = 0;
  private discoveredEdge = false;

  private minX?: number;
  private minY?: number;
  private maxX?: number;
  private maxY?: number;

  constructor(private surface: Surface) {
    VisibilityController.instance = this;
  }

  registerAgent(agent: StaticAgent) {
    this.agents.add(agent);

    let status = DiscoveryStatus.Pending;

    if (isBase(agent)) {
      this.base = agent;
      status = DiscoveryStatus.Discovered;
    } else {
      this.pendingAgents.add(agent);
    }

    const range = this.getVisibilityRange(agent);
    const coords = this.getVisibilityEdge(agent);
    this.edgeMap.set(agent.entity.getId(), coords);
    this.updateVisibility(...coords, range, status);
  }

  removeAgent(agent: StaticAgent) {
    if (!this.agents.has(agent)) {
      return;
    }

    if (isBase(agent)) {
      this.base = undefined;
    }

    const range = this.getVisibilityRange(agent);
    const coords = this.edgeMap.get(agent.entity.getId())!;
    this.surface.forCircle(...coords, range, (tile) =>
      tile.setDiscoveryStatus(DiscoveryStatus.Undiscovered)
    );

    this.agents.delete(agent);
    this.pendingAgents.delete(agent);
    this.edgeMap.delete(agent.entity.getId());
    this.update();
  }

  commit() {
    this.pendingAgents.clear();
    this.pendingRadius = 0;
    this.update();
  }

  updateBaseRange() {
    if (!this.base) {
      throw new Error("Updating base range without a base");
    }

    this.pendingRadius = this.getVisibilityRange(this.base);
    this.updateVisibility(
      ...this.getVisibilityEdge(this.base),
      this.pendingRadius,
      DiscoveryStatus.Pending
    );
  }

  getBBox() {
    return [
      [this.minX!, this.minY!],
      [this.maxX!, this.maxY!],
    ];
  }

  hasPendingAgents() {
    return this.pendingAgents.size > 0;
  }

  uncoverSpawnGroup(spawnGroup: SpawnGroup, method: DiscoveryMethod) {
    const others = WaveController.Instance.getSpawnGroups();
    this.discoveredSpawnGroups.add(spawnGroup);

    const [x, y] = spawnGroup.getCenter();
    this.updateVisibility(x, y, SpawnGroup.size, DiscoveryStatus.Discovered);

    // Make sure other spawngroups are not discovered automatically.
    others.forEach((spawnGroup) => {
      const [x, y] = spawnGroup.getCenter();
      this.surface.forCircle(x, y, SpawnGroup.size, (tile) => {
        if (tile.getDiscoveryStatus() === DiscoveryStatus.Undiscovered) {
          return;
        }

        tile.setDiscoveryStatus(DiscoveryStatus.Undiscovered);
      });
    });

    EventSystem.Instance.triggerEvent(GameEvent.Discover, {
      x,
      y,
      method,
    });
  }

  isEdgeDiscovered() {
    return this.discoveredEdge;
  }

  serialize(): VisibilityControllerData {
    const tiles = [...this.agents].map((agent) => {
      const tile = agent.getTile();
      const edge = this.edgeMap.get(agent.entity.getId())!;

      return { x: tile.getX(), y: tile.getY(), edge };
    });

    return {
      tiles,
      discoveredSpawnGroups: [...this.discoveredSpawnGroups].map((spawnGroup) =>
        spawnGroup.serialize()
      ),
    };
  }

  static deserialize(surface: Surface, data: VisibilityControllerData) {
    const visibilityController = new VisibilityController(surface);

    for (let tile of data.tiles) {
      const agent = surface
        .getTile(tile.x, tile.y)!
        .getStaticEntity()!
        .getAgent();

      if (isBase(agent)) {
        visibilityController.base = agent;
      }

      visibilityController.agents.add(agent);
      visibilityController.edgeMap.set(agent.entity.getId(), tile.edge);
    }

    for (let spawnGroupData of data.discoveredSpawnGroups) {
      visibilityController.discoveredSpawnGroups.add(
        SpawnGroup.deserialize(
          surface,
          visibilityController.base!.getTile(),
          spawnGroupData
        )
      );
    }

    return visibilityController;
  }

  private update() {
    this.minX = undefined;
    this.minY = undefined;
    this.maxX = undefined;
    this.maxY = undefined;

    this.agents.forEach((agent) => {
      const range = this.getVisibilityRange(agent);
      const coords = this.edgeMap.get(agent.entity.getId())!;
      this.surface.forCircle(...coords, range, (tile) =>
        tile.setDiscoveryStatus(DiscoveryStatus.Undiscovered)
      );
    });

    if (this.pendingRadius > 0 && this.base) {
      this.updateVisibility(
        ...this.getVisibilityEdge(this.base),
        this.pendingRadius,
        DiscoveryStatus.Pending
      );
    }

    this.agents.forEach((agent) => {
      const status = this.pendingAgents.has(agent)
        ? DiscoveryStatus.Pending
        : DiscoveryStatus.Discovered;

      const range = this.getVisibilityRange(agent);
      const coords = this.getVisibilityEdge(agent);
      this.edgeMap.set(agent.entity.getId(), coords);
      this.updateVisibility(...coords, range, status);
    });

    const removedSpawnGroups: SpawnGroup[] = [];
    const others = WaveController.Instance.getSpawnGroups();
    this.discoveredSpawnGroups.forEach((spawnGroup) => {
      if (spawnGroup.isExposed() === 0) {
        removedSpawnGroups.push(spawnGroup);
        return;
      }

      const center = spawnGroup.getCenter();
      this.updateVisibility(...center, 5, DiscoveryStatus.Discovered);
    });

    // @TODO: figure out a way to not have to undo discovering overlapping spawn points
    others.forEach((spawnGroup) => {
      const [x, y] = spawnGroup.getCenter();
      this.surface.forCircle(x, y, SpawnGroup.size, (tile) => {
        if (tile.getDiscoveryStatus() === DiscoveryStatus.Undiscovered) {
          return;
        }

        tile.setDiscoveryStatus(DiscoveryStatus.Undiscovered);
      });
    });

    removedSpawnGroups.forEach((spawnGroup) =>
      this.discoveredSpawnGroups.delete(spawnGroup)
    );
  }

  private getVisibilityRange(agent: Agent) {
    switch (agent.getType()) {
      case EntityType.Base:
        return (
          35 +
          (Manager.Instance.getLevel() - (this.pendingRadius > 0 ? 1 : 0)) * 2
        );
      case EntityType.Radar:
        return 21;
      default:
        throw new Error("Entity has no visibility defined");
    }
  }

  private getVisibilityEdge(agent: Agent): [number, number] {
    if (isBase(agent) || !this.base) {
      return [agent.entity.getAlignedX(), agent.entity.getAlignedY()];
    }

    let lastTile: Tile;
    const direction = Math.atan2(
      agent.entity.getAlignedY() - this.base.entity.getAlignedY(),
      agent.entity.getAlignedX() - this.base.entity.getAlignedX()
    );
    this.surface.forRay(
      this.base.entity.getAlignedX(),
      this.base.entity.getAlignedY(),
      direction,
      (tile) => {
        if (tile.getDiscoveryStatus() === DiscoveryStatus.Undiscovered) {
          return false;
        }

        lastTile = tile;
        return true;
      }
    );

    return lastTile!
      ? [lastTile.getX(), lastTile.getY()]
      : [agent.entity.getAlignedX(), agent.entity.getAlignedY()];
  }

  private updateVisibility(
    x: number,
    y: number,
    range: number,
    status: DiscoveryStatus
  ) {
    if (!this.minX || x - range / 2 < this.minX) {
      this.minX = x - range / 2;
    }
    if (!this.minY || y - range / 2 < this.minY) {
      this.minY = y - range / 2;
    }
    if (!this.maxX || x + range / 2 > this.maxX) {
      this.maxX = x + range / 2;
    }
    if (!this.maxY || y + range / 2 > this.maxY) {
      this.maxY = y + range / 2;
    }

    this.surface.forCircle(x, y, range, (tile) => {
      if (status === DiscoveryStatus.Pending && tile.isDiscovered()) {
        return;
      }

      if (
        status === DiscoveryStatus.Discovered &&
        tile.getType() === TileType.Void
      ) {
        this.discoveredEdge = true;
      }

      tile.setDiscoveryStatus(status);
    });
  }

  static get Instance() {
    return this.instance;
  }
}

export default VisibilityController;
