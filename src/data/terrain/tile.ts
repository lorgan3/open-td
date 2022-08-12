import Entity, { EntityType } from "../entity/entity";
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
}

export const FREE_TILES = new Set([TileType.Grass, TileType.Stone]);

export const STATIC_ENTITY_GROUND_TILE_MAP: Partial<
  Record<EntityType, TileType>
> = {
  [EntityType.Tower]: TileType.Obstructed,
  [EntityType.Wall]: TileType.Wall,
  [EntityType.Mortar]: TileType.Obstructed,
  [EntityType.Flamethrower]: TileType.Obstructed,
  [EntityType.Railgun]: TileType.Obstructed,
  [EntityType.ElectricFence]: TileType.ElectricFence,
};

class Tile {
  private staticEntity: Entity | null = null;
  private hash: string;
  private actualType: TileType;
  private towers: ITower[] = [];

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

  hasStaticEntity() {
    return this.staticEntity !== null;
  }

  setStaticEntity(entity: Entity) {
    if (this.staticEntity !== null) {
      throw new Error("A tile can only have 1 static entity.");
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

  isCoveredByTower() {
    return this.towers.length > 0;
  }

  removeTower(tower: ITower) {
    this.towers.splice(this.towers.indexOf(tower), 1);
  }

  getAvailableTowers() {
    return this.towers.filter((tower) => tower.getCooldown() === 0);
  }

  // @TODO instead of a string, just the index on the surface would be more efficient
  getHash() {
    return this.hash;
  }
}

export default Tile;
