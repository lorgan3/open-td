import Base from "./entity/base";
import { Agent, EntityType } from "./entity/entity";
import Surface from "./terrain/surface";
import Tile from "./terrain/tile";

class VisibilityController {
  private agents = new Set<Agent>();
  private edgeMap = new Map<number, [number, number]>();
  private base?: Base;

  private minX?: number;
  private minY?: number;
  private maxX?: number;
  private maxY?: number;

  constructor(private surface: Surface) {}

  registerAgent(agent: Agent) {
    this.agents.add(agent);

    if (agent instanceof Base) {
      this.base = agent;
    } else if (!!this.base) {
      const range = this.getVisibilityRange(this.base);
      const coords = this.getVisibilityEdge(this.base);
      this.edgeMap.set(agent.entity.getId(), coords);

      this.updateVisibility(...coords, range);
    }

    const range = this.getVisibilityRange(agent);
    const coords = this.getVisibilityEdge(agent);
    this.edgeMap.set(agent.entity.getId(), coords);
    this.updateVisibility(...coords, range);
  }

  removeAgent(agent: Agent) {
    if (!this.agents.has(agent)) {
      return;
    }

    if (agent instanceof Base) {
      this.base = undefined;
    }

    this.agents.forEach((agent) => {
      const range = this.getVisibilityRange(agent);
      const coords = this.edgeMap.get(agent.entity.getId())!;
      this.surface.forCircle(...coords, range, (tile) =>
        tile.setIsDiscovered(false)
      );
    });

    this.agents.delete(agent);
    this.edgeMap.delete(agent.entity.getId());

    this.minX = undefined;
    this.minY = undefined;
    this.maxX = undefined;
    this.maxY = undefined;

    this.agents.forEach((agent) => {
      const range = this.getVisibilityRange(agent);
      const coords = this.getVisibilityEdge(agent);
      this.edgeMap.set(agent.entity.getId(), coords);
      this.updateVisibility(...coords, range);
    });
  }

  getBBox() {
    return [
      [this.minX!, this.minY!],
      [this.maxX!, this.maxY!],
    ];
  }

  private getVisibilityRange(agent: Agent) {
    switch (agent.getType()) {
      case EntityType.Base:
        return 35 + this.agents.size * 5;
      case EntityType.Radar:
        return 24;
      default:
        throw new Error("Entity has no visibility defined");
    }
  }

  private getVisibilityEdge(agent: Agent): [number, number] {
    if (agent instanceof Base || !this.base) {
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
        if (!tile.isDiscovered()) {
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

  private updateVisibility(x: number, y: number, range: number) {
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

    this.surface.forCircle(x, y, range, (tile) => tile.setIsDiscovered());
  }
}

export default VisibilityController;
