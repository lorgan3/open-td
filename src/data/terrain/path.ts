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
    while (time > 0) {
      const remaining = 1 - (index % 1);
      const duration =
        (remaining / this.speed) *
        (this.speedMultipliers[this.tiles[index | 0].getType()] ?? 1);

      if (time > duration) {
        index += remaining;
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
