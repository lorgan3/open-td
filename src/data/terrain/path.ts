import Tile, { TileType } from "./tile";

interface Section {
  from: number;
  to: number;
  speedMultiplier: number;
}

class Path {
  private index = 0;
  private sectionIndex = 0;

  private constructor(
    private tiles: Tile[],
    private sections: Section[],
    private speed: number,
    private speedMultipliers: Partial<Record<TileType, number>>
  ) {}

  performStep(dt: number) {
    const step = this.index % 1;
    const start = this.index | 0;
    const from = this.tiles[start];

    const speed =
      (this.speed * dt) / (this.speedMultipliers[from.getType()] ?? 1);
    let end = (this.index + speed) | 0;
    if (start === end) {
      end++;
    }
    if (end >= this.tiles.length - 1) {
      end = this.tiles.length - 1;
    }
    const to = this.tiles[end];

    const multiplier =
      this.speedMultipliers[step > 0.5 ? to.getType() : from.getType()] ?? 1;
    this.index = Math.min(
      this.index + (this.speed * dt) / multiplier,
      this.tiles.length - 1
    );
    while (this.index > this.sections[this.sectionIndex].to) {
      this.sectionIndex++;
    }

    return { from, to, step };
  }

  getFuturePosition(time: number) {
    let index = this.index;
    let sectionIndex = this.sectionIndex;
    while (time > 0) {
      const section = this.sections[sectionIndex];
      const remaining = section.to - index;
      const duration = (remaining / this.speed) * section.speedMultiplier;

      if (time > duration) {
        index += remaining;
        sectionIndex++;
        time -= duration;
      } else {
        index += (remaining * time) / duration;
        time = 0;
      }

      if (index >= this.tiles.length - 1) {
        return this.tiles.length - 1;
      }
    }

    return index;
  }

  clone() {
    return new Path(
      this.tiles,
      this.sections,
      this.speed,
      this.speedMultipliers
    );
  }

  setIndex(index: number) {
    this.index = Math.max(Math.min(index, this.tiles.length - 1), 0);
    this.sectionIndex = this.sections.findIndex(
      ({ from, to }) => this.index >= from && this.index < to
    );
  }

  getIndex() {
    return this.index;
  }

  getTile(index = this.index) {
    return this.tiles[index | 0];
  }

  getCoordinates(index = this.index) {
    if (index >= this.tiles.length - 1) {
      const tile = this.tiles[this.tiles.length - 1];
      return { x: tile.getX(), y: tile.getY() };
    }

    const t = index % 1;
    const from = this.tiles[index | 0];
    const to = this.tiles[(index | 0) + 1];
    return {
      x: (to.getX() - from.getX()) * t + from.getX(),
      y: (to.getY() - from.getY()) * t + from.getY(),
    };
  }

  getSpeed() {
    return this.speed;
  }

  isDone() {
    return this.index === this.tiles.length - 1;
  }

  static fromTiles(
    tiles: Tile[],
    speed: number,
    speedMultipliers: Partial<Record<TileType, number>> = {}
  ) {
    const sections = tiles.reduce<Section[]>((arr, tile, index) => {
      const section = arr[arr.length - 1];
      const speedMultiplier = speedMultipliers[tile.getType()] ?? 1;

      if (!section) {
        return [
          {
            from: index,
            to: index + 1,
            speedMultiplier,
          },
        ];
      }

      if (section.speedMultiplier === speedMultiplier) {
        section.to++;
      } else {
        arr.push({
          from: index,
          to: index + 1,
          speedMultiplier,
        });
      }

      return arr;
    }, []);

    return new Path(tiles, sections, speed, speedMultipliers);
  }
}

export default Path;