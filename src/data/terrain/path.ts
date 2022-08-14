import { DESTRUCTIBLE_ENTITIES } from "../entity/entity";
import Tile, { TileType } from "./tile";

interface Section {
  from: number;
  to: number;
  cost: number;
}

class Path {
  private index = 0;
  private sectionIndex = 0;

  private constructor(
    private tiles: Tile[],
    private sections: Section[],
    private speed: number,
    private costs: number[],
    private checkpoints: number[]
  ) {}

  performStep(dt: number) {
    const step = this.index % 1;
    const start = this.index | 0;
    const from = this.tiles[start];

    const speed = (this.speed * dt) / (this.costs[start] ?? 1);
    let end = (this.index + speed) | 0;
    if (start === end) {
      end++;
    }
    if (end >= this.tiles.length - 1) {
      end = this.tiles.length - 1;
    }
    const to = this.tiles[end];

    // Stop at checkpoints if they're still valid
    while (this.checkpoints.length > 0) {
      const checkpoint = this.checkpoints[0];
      if (checkpoint && end >= checkpoint) {
        const tile = this.getNextCheckpoint();
        if (!tile.hasStaticEntity()) {
          this.checkpoints.shift();
        } else {
          this.index = end - 1;
          return { from: this.tiles[this.index], to, step: 0 };
        }
      } else {
        break;
      }
    }

    const multiplier = this.costs[end] ?? 1;
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
      const duration = (remaining / this.speed) * section.cost;

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
      this.costs,
      this.checkpoints
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

  getTiles() {
    return this.tiles;
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

  setSpeed(speed: number) {
    this.speed = speed;
  }

  isDone() {
    return this.index === this.tiles.length - 1;
  }

  isPaused() {
    return this.checkpoints[0] === this.index + 1 || this.isDone();
  }

  getNextCheckpoint() {
    return this.tiles[this.checkpoints[0]] || this.tiles[this.tiles.length - 1];
  }

  getCheckpoints() {
    return this.checkpoints.map((index) => this.tiles[index]);
  }

  getCurrentTile() {
    return this.tiles[this.index | 0];
  }

  private static calculateSections(tiles: Tile[], costs: number[]) {
    return tiles.reduce<Section[]>((arr, tile, index) => {
      const section = arr[arr.length - 1];
      const cost = costs[index];

      if (!section) {
        return [
          {
            from: index,
            to: index + 1,
            cost,
          },
        ];
      }

      if (section.cost === cost) {
        section.to++;
      } else {
        arr.push({
          from: index,
          to: index + 1,
          cost,
        });
      }

      return arr;
    }, []);
  }

  static fromTiles(
    tiles: Tile[],
    speed: number,
    speedMultipliers: Partial<Record<TileType, number>> = {}
  ) {
    const costs = tiles.map((tile) => speedMultipliers[tile.getType()] ?? 1);
    const sections = this.calculateSections(tiles, costs);

    const checkpoints: number[] = [];
    tiles.forEach((tile, index) => {
      if (tile.hasStaticEntity()) {
        if (
          DESTRUCTIBLE_ENTITIES.has(
            tile.getStaticEntity()!.getAgent().getType()
          )
        ) {
          checkpoints.push(index);
        }
      }
    });

    return new Path(tiles, sections, speed, costs, checkpoints);
  }

  static fromMapAndCosts(
    from: Tile,
    to: Tile,
    map: Map<string, Tile>,
    scores: Map<string, number>
  ) {
    let current = to;
    const tiles = [current];
    const costs = [scores.get(current.getHash())!];

    while (current !== from) {
      current = map.get(current.getHash())!;

      const score = scores.get(current.getHash())!;
      costs[tiles.length - 1] -= score;

      costs.push(score);
      tiles.push(current);
    }

    const sections = this.calculateSections(tiles.reverse(), costs.reverse());

    const checkpoints: number[] = [];
    tiles.forEach((tile, index) => {
      if (tile.hasStaticEntity()) {
        if (
          DESTRUCTIBLE_ENTITIES.has(
            tile.getStaticEntity()!.getAgent().getType()
          )
        ) {
          checkpoints.push(index);
        }
      }
    });

    return new Path(tiles, sections, 1, costs, checkpoints);
  }
}

export default Path;
