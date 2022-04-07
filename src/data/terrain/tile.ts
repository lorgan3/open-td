import Entity from "../entity/entity";

export enum TileType {
  Void = 0,
  Grass = 1,
  Stone = 2,
  Water = 3,
  Obstructed = 4,
}

class Tile {
  private staticEntity: Entity | null = null;
  private hash: string;
  private actualType: TileType;

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
    this.actualType = TileType.Obstructed;
  }

  clearStaticEntity() {
    this.staticEntity = null;
    this.actualType = this.type;
  }

  // @TODO instead of a string, just the index on the surface would be more efficient
  getHash() {
    return this.hash;
  }
}

export default Tile;
