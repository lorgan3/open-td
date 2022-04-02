import Tile from "./tile";

class Surface {
  public map!: Tile[];

  constructor(private width = 50, private height = 25) {
    this.initialize();
  }

  private initialize() {
    this.map = new Array(this.width * this.height);
    for (let j = 0; j < this.height; j++) {
      for (let i = 0; i < this.width; i++) {
        this.map[j * this.width + i] = new Tile(i, j);
      }
    }
  }

  public getTile(x: number, y: number) {
    return this.map[y * this.width + x];
  }

  public getRow(y: number) {
    const offset = y * this.width;
    return this.map.slice(offset, offset + this.width);
  }

  public getColumn(x: number) {
    const column = new Array(this.height);
    for (let i = 0; i < this.height; i++) {
      column[i] = this.getTile(x, i);
    }
    return column;
  }
}

export default Surface;
