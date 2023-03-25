import Surface from "../surface";
import Tile from "../tile";
import Heap from "heap";
import Path from "./path";
import {
  DEFAULT_LAND_BASED_COSTS,
  DEFAULT_LAND_BASED_MULTIPLIERS,
} from "./definitions";
import { TileType } from "../constants";

export const NEIGHBORS = [
  [0, -1],
  [-1, 0],
  [1, 0],
  [0, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
];

// If the sum of the scores of the 2 diagonal tiles is higher than this amount it means diagonal moves are not possible.
// This is to prevent just going between a diagonal wall.
export const MAX_DIAGONAL_COST = 150;

// https://en.wikipedia.org/wiki/A*_search_algorithm
class Pathfinder {
  private neighbors: typeof NEIGHBORS;
  private computedCosts!: Array<number | null>;
  private computedMultipliers!: number[];
  private scaledWidth!: number;
  private scaledHeight!: number;
  private computedVersion = -1;

  constructor(
    private surface: Surface,
    public costMultipliers: Partial<
      Record<TileType, number>
    > = DEFAULT_LAND_BASED_MULTIPLIERS,
    public costs: Partial<Record<TileType, number>> = DEFAULT_LAND_BASED_COSTS,
    public scale = 1
  ) {
    this.neighbors = NEIGHBORS.map(([x, y]) => [x * scale, y * scale]);
  }

  getPath(
    from: Tile,
    to: Tile,
    costMultiplierOverride?: (costMultiplier: number, tile: Tile) => number
  ) {
    if (this.computedVersion !== this.surface.version) {
      this.computeCosts();
    }

    // Align with grid
    from = this.surface.getTile(
      Math.floor(from.getX() / this.scale) * this.scale,
      Math.floor(from.getY() / this.scale) * this.scale
    )!;
    to = this.surface.getTile(
      Math.floor(to.getX() / this.scale) * this.scale,
      Math.floor(to.getY() / this.scale) * this.scale
    )!;

    const costMultiplier = costMultiplierOverride
      ? (tile: Tile) =>
          costMultiplierOverride(
            this.computedMultipliers[this.getIndex(tile)],
            tile
          )
      : (tile: Tile) => this.computedMultipliers[this.getIndex(tile)];

    const visitedTiles = new Set<Tile>();

    // Cheapest path from n to start
    const movementScore = this.computedCosts[this.getIndex(from)] ?? 1;
    const score = movementScore * costMultiplier(from);

    const movementScores = new Map<string, number>();
    movementScores.set(from.getHash(), score);

    const gScores = new Map<string, number>();
    gScores.set(from.getHash(), score);

    // Cheapest path from n to end
    const fScores = new Map<string, number>();
    fScores.set(from.getHash(), score + this.heuristic(from, to));

    const activeTiles = new Heap<Tile>(
      (a, b) =>
        (fScores.get(a.getHash()) ?? Infinity) -
        (fScores.get(b.getHash()) ?? Infinity)
    );
    activeTiles.push(from);
    const path = new Map<string, Tile>();

    while (!activeTiles.empty()) {
      let current = activeTiles.pop()!;
      if (to === current) {
        return Path.fromMapAndCosts(this, from, to, path);
      }

      const currentHash = current.getHash();

      const neighbors = this.neighbors.map(([x, y]) =>
        this.surface.getTile(x + current.getX(), y + current.getY())
      );

      // Unrolled for performance I guess
      const data: Array<number | undefined> = [];
      this.setCostAndMultiplier(0, data, costMultiplier, neighbors[0]);
      this.setCostAndMultiplier(1, data, costMultiplier, neighbors[1]);
      this.setCostAndMultiplier(2, data, costMultiplier, neighbors[2]);
      this.setCostAndMultiplier(3, data, costMultiplier, neighbors[3]);
      this.setDiagonalCostAndMultiplier(
        4,
        0,
        1,
        data,
        costMultiplier,
        neighbors[4]
      );
      this.setDiagonalCostAndMultiplier(
        5,
        0,
        2,
        data,
        costMultiplier,
        neighbors[5]
      );
      this.setDiagonalCostAndMultiplier(
        6,
        1,
        3,
        data,
        costMultiplier,
        neighbors[6]
      );
      this.setDiagonalCostAndMultiplier(
        7,
        2,
        3,
        data,
        costMultiplier,
        neighbors[7]
      );

      neighbors.forEach((neighbor, index) => {
        if (!neighbor) {
          return;
        }

        const cost = data[index * 2];
        if (!cost || visitedTiles.has(neighbor)) {
          return;
        }

        const neighborHash = neighbor.getHash();
        const score = gScores.get(currentHash)! + data[index * 2 + 1]!;

        if (score < (gScores.get(neighborHash) ?? Infinity)) {
          const movementScore = movementScores.get(currentHash)! + cost;
          movementScores.set(neighborHash, movementScore);

          path.set(neighborHash, current);
          gScores.set(neighborHash, score);
          fScores.set(neighborHash, score + this.heuristic(neighbor, to));

          activeTiles.push(neighbor);
          visitedTiles.add(current);
        }
      });
    }
  }

  getHivePath(tiles: Tile[], to: Tile) {
    const visitedTiles: Record<string, number> = {};

    const multiplierFn = (costMultiplier: number, tile: Tile) => {
      return (visitedTiles[tile.getHash()] ?? 1) * costMultiplier;
    };

    return tiles.reduce<Array<Path | undefined>>((paths, from, i) => {
      const path = this.getPath(from, to, multiplierFn);
      paths.push(path);

      if (path && tiles.length > i - 1) {
        path.getTiles().forEach((tile) => {
          if (tile.hasStaticEntity()) {
            visitedTiles[tile.getHash()] = 0.85;
          }

          visitedTiles[tile.getHash()] =
            visitedTiles[tile.getHash()] + 0.1 || 1.1;
        });
      }

      return paths;
    }, []);
  }

  getWaypointPath(waypoints: Tile[]) {
    const paths: Path[] = [];

    for (let i = 0; i < waypoints.length - 1; i++) {
      paths.push(this.getPath(waypoints[i], waypoints[i + 1])!);
    }

    return Path.fromPaths(this, paths);
  }

  // From and to should be 1 tile apart
  getCost(from: Tile, to?: Tile) {
    if (this.computedVersion !== this.surface.version) {
      this.computeCosts();
    }

    const fromCost = this.computedCosts[this.getIndex(from)];
    if (!to) {
      return fromCost;
    }

    const toCost = this.computedCosts[this.getIndex(to)];
    if (!fromCost || !toCost) {
      return null;
    }

    const cost = (fromCost + toCost) / 2;
    if (
      !fromCost ||
      !toCost ||
      from.getX() === to.getX() ||
      from.getY() == to.getY()
    ) {
      return cost;
    }

    // calculate the penalty for moving diagonally
    return (
      cost +
      (this.computedCosts[
        ((to.getY() / this.scale) | 0) * this.scaledWidth +
          ((from.getX() / this.scale) | 0)
      ]! +
        this.computedCosts[
          ((from.getY() / this.scale) | 0) * this.scaledWidth +
            ((to.getX() / this.scale) | 0)
        ]!) /
        4
    );
  }

  getSurface() {
    return this.surface;
  }

  // Just manhattan for now
  private heuristic(from: Tile, to: Tile) {
    return (
      Math.abs(from.getX() - to.getX()) + Math.abs(from.getY() - to.getY())
    );
  }

  private setCostAndMultiplier(
    index: number,
    data: Array<number | undefined>,
    costMultiplier: (tile: Tile) => number,
    tile?: Tile
  ) {
    if (!tile) {
      return;
    }

    const cost = this.computedCosts[this.getIndex(tile)];
    if (cost) {
      data[index * 2] = cost;
      data[index * 2 + 1] = cost * costMultiplier(tile);
    }
  }

  private setDiagonalCostAndMultiplier(
    index: number,
    d1: number,
    d2: number,
    data: Array<number | undefined>,
    costMultiplier: (tile: Tile) => number,
    tile?: Tile
  ) {
    if (!tile || !data[d1 * 2] || !data[d2 * 2]) {
      return;
    }

    const diagonalMultipliedCost = data[d1 * 2 + 1]! + data[d2 * 2 + 1]!;
    if (diagonalMultipliedCost > MAX_DIAGONAL_COST) {
      return;
    }

    const cost = this.computedCosts[this.getIndex(tile)];
    if (cost) {
      data[index * 2] = cost + (data[d1 * 2]! + data[d2 * 2]!) / 4;
      data[index * 2 + 1] =
        cost * costMultiplier(tile) + diagonalMultipliedCost / 4;
    }
  }

  private computeCosts() {
    this.computedVersion = this.surface.version;

    const squaredScale = this.scale ** 2;
    this.scaledWidth = Math.floor(this.surface.getWidth() / this.scale);
    this.scaledHeight = Math.floor(this.surface.getHeight() / this.scale);
    const length = this.scaledWidth * this.scaledHeight;
    this.computedCosts = new Array(length);
    this.computedMultipliers = new Array(length);

    for (let i = 0; i < this.scaledWidth; i++) {
      for (let j = 0; j < this.scaledHeight; j++) {
        const tiles = this.surface.getEntityTiles(
          i * this.scale,
          j * this.scale,
          this.scale
        );
        let cost: number | null = 0;
        let multiplier = 0;
        for (let k = 0; k < tiles.length; k++) {
          let type = tiles[k].getType();
          if (!this.costs[type]) {
            cost = null;
            multiplier = squaredScale;
            break;
          }

          cost += this.costs[type]!;
          multiplier += this.costMultipliers[type] ?? 1;
        }

        const index = j * this.scaledWidth + i;
        this.computedCosts[index] = cost === null ? null : cost / squaredScale;
        this.computedMultipliers[index] = multiplier / squaredScale;
      }
    }
  }

  private getIndex(tile: Tile) {
    return (
      ((tile.getY() / this.scale) | 0) * this.scaledWidth +
      ((tile.getX() / this.scale) | 0)
    );
  }
}

export default Pathfinder;
