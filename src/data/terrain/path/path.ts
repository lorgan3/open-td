import { Agent } from "../../entity/entity";
import { Checkpoint } from "../checkpoint";
import Pathfinder from "./pathfinder";
import Tile from "../tile";

interface Section {
  from: number;
  to: number;
  cost: number;
}

class Path {
  private index = 0;
  private sectionIndex = 0;
  private tileSet: Set<Tile>;

  private constructor(
    private pathfinder: Pathfinder,
    private tiles: Tile[],
    private sections: Section[],
    private speed: number,
    private costs: number[],
    private checkpoints: Checkpoint[] = []
  ) {
    this.tileSet = new Set(tiles);
  }

  performStep(agent: Agent, dt: number) {
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
      if (checkpoint && end >= checkpoint.index) {
        if (checkpoint.isCleared(this.tiles, agent)) {
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
      this.pathfinder,
      this.tiles,
      this.sections,
      this.speed,
      this.costs,
      [...this.checkpoints]
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

  getLength() {
    return this.tiles.length;
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

  isPaused(agent: Agent) {
    if (this.isDone()) {
      return true;
    }

    const nextCheckpoint = this.getNextCheckpoint();
    return (
      nextCheckpoint &&
      nextCheckpoint.index === this.index + 1 &&
      !nextCheckpoint.isCleared(this.tiles, agent)
    );
  }

  getNextCheckpoint() {
    return this.checkpoints[0] || null;
  }

  getCheckpoints() {
    return this.checkpoints;
  }

  setCheckpoints(checkpoints: Checkpoint[]) {
    this.checkpoints = checkpoints;
  }

  getCurrentTile() {
    return this.tiles[this.index | 0];
  }

  recompute() {
    const surface = this.pathfinder.getSurface();

    let fromTile: Tile | undefined;
    for (let i = 0; i < this.tiles.length; i++) {
      const tile = this.tiles[i];
      const toTile = surface.getTile(tile.getX(), tile.getY())!;
      this.tiles[i] = toTile;
      this.costs[i] = this.pathfinder.getCost(toTile, fromTile) ?? 1;
      fromTile = toTile;

      if (tile !== toTile) {
        this.tileSet.delete(tile);
        this.tileSet.add(toTile);
      }
    }

    this.sections = Path.calculateSections(this.tiles, this.costs);
  }

  isAffectedByTiles(tiles: Set<Tile>) {
    for (let tile of tiles) {
      if (this.tileSet.has(tile)) {
        return true;
      }
    }

    return false;
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

  static fromTiles(pathfinder: Pathfinder, tiles: Tile[], speed = 1) {
    const path = new Path(pathfinder, tiles, [], speed, []);
    path.recompute();

    return path;
  }

  static fromMapAndCosts(
    pathfinder: Pathfinder,
    from: Tile,
    to: Tile,
    map: Map<string, Tile>,
    speed = 1
  ) {
    let current = to;
    const tiles = [current];
    while (current !== from) {
      current = map.get(current.getHash())!;
      tiles.push(current);
    }

    return this.fromTiles(pathfinder, tiles.reverse(), speed);
  }
}

export default Path;
