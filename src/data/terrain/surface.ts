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
    if (x >= this.width || x < 0 || y >= this.height || y < 0) {
      return undefined;
    }

    return this.map[y * this.width + x];
  }

  public getRow(y: number) {
    const offset = y * this.width;
    return this.map.slice(offset, offset + this.width);
  }

  public getColumn(x: number) {
    const column: Tile[] = new Array(this.height);
    for (let i = 0; i < this.height; i++) {
      column[i] = this.getTile(x, i)!;
    }
    return column;
  }

  public forLine(
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    fn: (tile: Tile) => void
  ) {
    // Determine the direction of the line
    const xDiff = targetX - sourceX;
    const yDiff = targetY - sourceY;

    // Determine the step size so that every loop at least one direction changes by 1
    let xStep = xDiff / (xDiff + yDiff);
    let yStep = yDiff / (xDiff + yDiff);
    const ratio = 1 + (xStep > yStep ? yStep / xStep : xStep / yStep);
    xStep *= ratio * Math.sign(xDiff);
    yStep *= ratio * Math.sign(yDiff);

    while (true) {
      const x = Math.round(sourceX);
      const y = Math.round(sourceY);
      const tile = this.getTile(x, y);

      if (!tile) {
        break;
      }

      fn(tile);

      if (x === targetX && y === targetY) {
        break;
      }

      sourceX += xStep;
      sourceY += yStep;
    }
  }
}

export default Surface;
