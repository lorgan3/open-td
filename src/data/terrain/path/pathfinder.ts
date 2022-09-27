import Surface from "../surface";
import Tile, { TileType } from "../tile";
import Heap from "heap";
import Path from "./path";
import {
  DEFAULT_LAND_BASED_COSTS,
  DEFAULT_LAND_BASED_MULTIPLIERS,
} from "./definitions";

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

export const defaultCostMultiplier = (tile: Tile) =>
  DEFAULT_LAND_BASED_MULTIPLIERS[tile.getType()] ?? 1;

// https://en.wikipedia.org/wiki/A*_search_algorithm
class Pathfinder {
  private costFn: (tile: Tile) => number | null;

  constructor(
    private surface: Surface,
    private costMultiplier = defaultCostMultiplier,
    costs:
      | Partial<Record<TileType, number>>
      | ((tile: Tile) => number | null) = DEFAULT_LAND_BASED_COSTS
  ) {
    this.costFn =
      typeof costs === "function"
        ? costs
        : (tile: Tile) => costs[tile.getType()] ?? null;
  }

  getPath(
    from: Tile,
    to: Tile,
    costMultiplierOverride?: (tile: Tile) => number
  ) {
    const costMultiplier = costMultiplierOverride ?? this.costMultiplier;

    const visitedTiles = new Set<Tile>();

    // Cheapest path from n to start
    const movementScore = this.costFn(from) ?? 1;
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

      const neighbors = NEIGHBORS.map(([x, y]) =>
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

    const multiplierFn = (tile: Tile) => {
      return (visitedTiles[tile.getHash()] ?? 1) * this.costMultiplier(tile);
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

  // From and to should be 1 tile apart
  getCost(from: Tile, to?: Tile) {
    if (!to) {
      return this.costFn(from);
    }

    const fromCost = this.costFn(from);
    const toCost = this.costFn(to);
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
      (this.costFn(this.surface.getTile(from.getX(), to.getY())!)! +
        this.costFn(this.surface.getTile(to.getX(), from.getY())!)!) /
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

    const cost = this.costFn(tile);

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

    const cost = this.costFn(tile);

    if (cost) {
      data[index * 2] = cost + (data[d1 * 2]! + data[d2 * 2]!) / 4;
      data[index * 2 + 1] =
        cost * costMultiplier(tile) + diagonalMultipliedCost / 4;
    }
  }
}

export default Pathfinder;
