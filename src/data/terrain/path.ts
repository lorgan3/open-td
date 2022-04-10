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
