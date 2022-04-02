export enum TileType {
  Void = 0,
  Grass = 1,
  Stone = 2,
  Water = 3,
}

class Tile {
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
}

export default Tile;
