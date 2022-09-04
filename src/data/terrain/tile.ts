import Entity, {
  EntityType,
  isStaticAgent,
  StaticAgent,
} from "../entity/entity";
import { ITower } from "../entity/towers";

export enum TileType {
  Void = 0,
  Grass = 1,
  Stone = 2,
  Water = 3,
  Obstructed = 4,
  Wall = 5,
  Spore = 6,
  ElectricFence = 7,
  Fence = 8,
  Freezer = 9,
  Bridge = 10,
  Dirt = 11,
  Snow = 12,
  Sand = 13,
  Ice = 14,
  PlayerBuilding = 15,
  NaturalFeature = 16,
  Base = 17,
}

export const FREE_TILES = new Set([
  TileType.Grass,
  TileType.Stone,
  TileType.Dirt,
  TileType.Sand,
  TileType.Snow,
]);

export const FREE_TILES_INCLUDING_WATER = new Set([
  ...FREE_TILES,
  TileType.Water,
  TileType.Ice,
  TileType.Bridge,
  TileType.NaturalFeature,
]);

export const FREE_TILES_INCLUDING_BUILDINGS = new Set([
  ...FREE_TILES_INCLUDING_WATER,
  TileType.Freezer,
  TileType.ElectricFence,
  TileType.Fence,
]);

export const STATIC_ENTITY_GROUND_TILE_MAP: Partial<
  Record<EntityType, TileType>
> = {
  [EntityType.Tower]: TileType.Obstructed,
  [EntityType.Wall]: TileType.Wall,
  [EntityType.Mortar]: TileType.Obstructed,
  [EntityType.Flamethrower]: TileType.Obstructed,
  [EntityType.Railgun]: TileType.Obstructed,
  [EntityType.ElectricFence]: TileType.ElectricFence,
  [EntityType.Fence]: TileType.Fence,
  [EntityType.Freezer]: TileType.Freezer,
  [EntityType.Radar]: TileType.PlayerBuilding,
  [EntityType.PowerPlant]: TileType.Base,
  [EntityType.Tree]: TileType.NaturalFeature,
  [EntityType.Rock]: TileType.NaturalFeature,
  [EntityType.Armory]: TileType.Base,
  [EntityType.Base]: TileType.Base,
  [EntityType.Market]: TileType.Base,
  [EntityType.SpeedBeacon]: TileType.Obstructed,
};

export type TileWithStaticEntity = { getStaticEntity: () => Entity } & Tile;

class Tile {
  private staticEntity: Entity | null = null;
  private hash: string;
  private actualType: TileType;
  private towers: ITower[] = [];
  private linkedAgents?: Set<StaticAgent>;
  private discovered = false;

  constructor(
    private x: number,
    private y: number,
    private type = TileType.Void
  ) {
    this.hash = `[${this.x}, ${this.y}]`;
    this.actualType = type;
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

  getType() {
    return this.actualType;
  }

  getStaticEntity() {
    return this.staticEntity;
  }

  hasStaticEntity(): this is TileWithStaticEntity {
    return this.staticEntity !== null;
  }

  setStaticEntity(entity: Entity) {
    if (this.staticEntity !== null) {
      throw new Error("A tile can only have 1 static entity.");
    }

    const agent = entity.getAgent();
    if (isStaticAgent(agent)) {
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

  addTower(tower: ITower) {
    if (!this.towers.includes(tower)) {
      this.towers.push(tower);
    }
  }

  setIsDiscovered(discovered = true) {
    this.discovered = discovered;
  }

  isDiscovered() {
    return this.discovered;
  }

  isCoveredByTower() {
    return this.towers.length > 0;
  }

  removeTower(tower: ITower) {
    this.towers.splice(this.towers.indexOf(tower), 1);
  }

  getAvailableTowers() {
    return this.towers.filter((tower) => tower.getCooldown() <= 0);
  }

  addLinkedAgent(agent: StaticAgent) {
    if (!this.linkedAgents) {
      this.linkedAgents = new Set();
    }

    this.linkedAgents.add(agent);

    const staticAgent = this.staticEntity?.getAgent() as StaticAgent;
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
}

export default Tile;
