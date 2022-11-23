import type Base from "../entity/base";
import { Agent } from "../entity/entity";
import Manager from "./manager";
import Surface from "../terrain/surface";
import Tile from "../terrain/tile";
import { DiscoveryStatus } from "../terrain/constants";
import { EntityType } from "../entity/constants";

const isBase = (agent: Agent): agent is Base => {
  return agent.getType() === EntityType.Base;
};

class VisibilityController {
  private static instance: VisibilityController;

  private agents = new Set<Agent>();
  private edgeMap = new Map<number, [number, number]>();
  private pendingAgents = new Set<Agent>();
  private base?: Base;

  private minX?: number;
  private minY?: number;
  private maxX?: number;
  private maxY?: number;

  constructor(private surface: Surface) {
    VisibilityController.instance = this;
  }

  registerAgent(agent: Agent) {
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

  removeAgent(agent: Agent) {
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
    this.update();
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

    this.agents.forEach((agent) => {
      const status = this.pendingAgents.has(agent)
        ? DiscoveryStatus.Pending
        : DiscoveryStatus.Discovered;

      const range = this.getVisibilityRange(agent);
      const coords = this.getVisibilityEdge(agent);
      this.edgeMap.set(agent.entity.getId(), coords);
      this.updateVisibility(...coords, range, status);
    });
  }

  updateBaseRange() {
    if (!this.base) {
      throw new Error("Updating base range without a base");
    }

    const range = this.getVisibilityRange(this.base);
    const coords = this.getVisibilityEdge(this.base);
    this.edgeMap.set(this.base.entity.getId(), coords);
    this.updateVisibility(...coords, range, DiscoveryStatus.Pending);
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

  private getVisibilityRange(agent: Agent) {
    switch (agent.getType()) {
      case EntityType.Base:
        return 35 + Manager.Instance.getWaveController().getLevel() * 2;
      case EntityType.Radar:
        return 35;
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

      tile.setDiscoveryStatus(status);
    });
  }

  static get Instance() {
    return this.instance;
  }
}

export default VisibilityController;
