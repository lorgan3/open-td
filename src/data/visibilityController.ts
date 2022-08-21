import Base from "./entity/base";
import { Agent, EntityType } from "./entity/entity";
import Surface from "./terrain/surface";

class VisibilityController {
  private agents = new Set<Agent>();
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
      this.updateVisibility(
        this.base.entity.getAlignedX(),
        this.base.entity.getAlignedY(),
        range
      );
    }

    const range = this.getVisibilityRange(agent);
    this.updateVisibility(
      agent.entity.getAlignedX(),
      agent.entity.getAlignedY(),
      range
    );
  }

  removeAgent(agent: Agent) {
    if (!this.agents.has(agent)) {
      return;
    }

    if (agent instanceof Base) {
      this.base = undefined;
    } else {
      const range = this.getVisibilityRange(this.base!);
      this.surface.forCircle(
        this.base!.entity.getX(),
        this.base!.entity.getY(),
        range,
        (tile) => tile.setIsDiscovered(false)
      );
    }

    const range = this.getVisibilityRange(agent);
    this.surface.forCircle(
      agent.entity.getX(),
      agent.entity.getY(),
      range,
      (tile) => tile.setIsDiscovered(false)
    );

    this.agents.delete(agent);
    this.minX = undefined;
    this.minY = undefined;
    this.maxX = undefined;
    this.maxY = undefined;

    this.agents.forEach((agent) => {
      const range = this.getVisibilityRange(agent);
      this.updateVisibility(
        agent.entity.getAlignedX(),
        agent.entity.getAlignedY(),
        range
      );
    });
  }

  getBBox() {
    return [
      [this.minX, this.minY],
      [this.maxX, this.maxY],
    ];
  }

  private getVisibilityRange(agent: Agent) {
    switch (agent.getType()) {
      case EntityType.Base:
        return 55 + this.agents.size * 5;
      case EntityType.Radar:
        return 24;
      default:
        throw new Error("Entity has no visibility defined");
    }
  }

  private updateVisibility(x: number, y: number, range: number) {
    if (!this.minX || x - range / 2 < this.minX) {
      this.minX = x - range / 2;
    }
    if (!this.minY || y - range / 2 < this.minY) {
      this.minY = y - range / 2;
    }
    if (!this.maxX || x + range / 2 > this.maxX) {
      this.maxX = x - range / 2;
    }
    if (!this.maxY || y + range / 2 > this.maxY) {
      this.maxY = y - range / 2;
    }

    this.surface.forCircle(x, y, range, (tile) => tile.setIsDiscovered());
  }
}

export default VisibilityController;
