import Entity from "../entity/entity";

export enum TileType {
  Void = 0,
  Grass = 1,
  Stone = 2,
  Water = 3,
}

class Tile {
  private staticEntity: Entity | null = null;

  constructor(
    private x: number,
    private y: number,
    private type = TileType.Void
  ) {}

  getX() {
    return this.x;
  }

  getY() {
    return this.y;
  }

  getType() {
    return this.type;
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
  }

  clearStaticEntity() {
    this.staticEntity = null;
  }
}

export default Tile;
