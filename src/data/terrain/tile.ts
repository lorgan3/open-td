import StaticEntity, {
  isStaticAgent,
  StaticAgent,
} from "../entity/staticEntity";
import { ITower } from "../entity/towers";
import {
  AltTileType,
  ALT_TO_BASE_TYPE,
  DiscoveryStatus,
  STATIC_ENTITY_GROUND_TILE_MAP,
  TileType,
} from "./constants";

export type TileWithStaticEntity = {
  getStaticEntity: () => StaticEntity;
} & Tile;

export interface SerializedTile {
  x: number;
  y: number;
  type: TileType | AltTileType;
}

class Tile {
  private staticEntity: StaticEntity | null = null;
  private hash: string;
  private actualType: TileType;
  private type: TileType;
  private towers: ITower[] = [];
  private linkedAgents?: Set<StaticAgent>;
  private discoveryStatus = DiscoveryStatus.Undiscovered;

  constructor(
    private x: number,
    private y: number,
    private altType: TileType | AltTileType = TileType.Void
  ) {
    this.hash = `[${this.x}, ${this.y}]`;
    this.type = ALT_TO_BASE_TYPE[altType as AltTileType] ?? altType;
    this.actualType = this.type;
  }

  serialize(): SerializedTile {
    return {
      x: this.x,
      y: this.y,
      type: this.type,
    };
  }

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getBaseType() {
    return this.type;
  }

  /**
   * Should be used for graphical purposes only.
   */
  getAltType() {
    return this.altType;
  }

  /**
   * Should be used for graphical purposes only.
   */
  getAnimation() {
    if (this.type === TileType.Water) {
      return [TileType.Water, AltTileType.WaterAlt, AltTileType.WaterStill];
    }

    return [this.altType];
  }

  getType() {
    return this.actualType;
  }

  getStaticEntity(): StaticEntity | null {
    return this.staticEntity;
  }

  hasStaticEntity(): this is TileWithStaticEntity {
    return this.staticEntity !== null;
  }

  setStaticEntity(entity: StaticEntity) {
    if (entity === this.staticEntity) {
      return;
    }

    if (this.staticEntity !== null) {
      throw new Error("A tile can only have 1 static entity.");
    }

    const agent = entity.getAgent();
    if (isStaticAgent(agent) && agent.getTile().getHash() === this.getHash()) {
      agent.updateTile(this);

      if (this.linkedAgents && agent.updateLinkedAgents) {
        agent.updateLinkedAgents(this.linkedAgents);
      }
    }

    this.staticEntity = entity;
    this.actualType =
      STATIC_ENTITY_GROUND_TILE_MAP[entity.getAgent().getType()] || this.type;
  }

  clearStaticEntity() {
    this.staticEntity = null;
    this.actualType = this.type;
  }

  isStaticEntityRoot() {
    return this.staticEntity?.getAgent().getTile() === this;
  }

  addTower(tower: ITower) {
    if (!this.towers.includes(tower)) {
      this.towers.push(tower);
    }
  }

  setDiscoveryStatus(status: DiscoveryStatus) {
    this.discoveryStatus = status;
  }

  isDiscovered() {
    return this.discoveryStatus === DiscoveryStatus.Discovered;
  }

  getDiscoveryStatus() {
    return this.discoveryStatus;
  }

  isCoveredByTower() {
    return this.isDiscovered() && this.towers.length > 0;
  }

  removeTower(tower: ITower) {
    this.towers.splice(this.towers.indexOf(tower), 1);
  }

  getAvailableTowers() {
    return this.towers.filter((tower) => tower.getCooldown() <= 0);
  }

  getTowers() {
    return this.towers;
  }

  addLinkedAgent(agent: StaticAgent) {
    if (!this.linkedAgents) {
      this.linkedAgents = new Set();
    }

    this.linkedAgents.add(agent);

    const staticAgent = this.staticEntity?.getAgent();
    if (staticAgent && staticAgent.updateLinkedAgents) {
      staticAgent.updateLinkedAgents(this.linkedAgents);
    }
  }

  removeLinkedAgent(agent: StaticAgent) {
    if (!this.linkedAgents) {
      return;
    }

    this.linkedAgents.delete(agent);

    const staticAgent = this.staticEntity?.getAgent();
    if (isStaticAgent(staticAgent) && staticAgent.updateLinkedAgents) {
      staticAgent.updateLinkedAgents(this.linkedAgents);
    }
  }

  getLinkedAgents() {
    return this.linkedAgents;
  }

  // @TODO instead of a string, just the index on the surface would be more efficient
  getHash() {
    return this.hash;
  }

  sync(other: Tile) {
    this.towers = other.towers;
    this.discoveryStatus = other.discoveryStatus;
  }
}

export default Tile;
