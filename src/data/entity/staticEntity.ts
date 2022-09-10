import Tile, { TileWithStaticEntity } from "../terrain/tile";
import Entity, { Agent } from "./entity";

export interface StaticAgent extends Agent {
  entity: StaticEntity;
  getTile(): TileWithStaticEntity;
  updateTile(tile: Tile): void;
  updateLinkedAgents?: (linkedAgents: Set<StaticAgent>) => void;
}

// There doesn't seem to be any way to properly define static properties on an interface :(
export interface StaticAgentStatics {
  scale: number;
}

export function isStaticAgent(agent?: Agent | null): agent is StaticAgent {
  return agent ? "getTile" in agent : false;
}

class StaticEntity extends Entity {
  constructor(x: number, y: number, agent: StaticAgent) {
    super(x, y, agent);
  }

  getAgent() {
    return this.agent as StaticAgent;
  }
}

export default StaticEntity;
