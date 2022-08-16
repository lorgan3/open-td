import Surface from "./surface";
import Tile, { TileType } from "./tile";
import Heap from "heap";
import Path from "./path";

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

// If the sum of the costs of the 2 diagonal tiles is higher than this amount it means diagonal moves are not possible.
// This is to prevent just going between a diagonal wall.
export const MAX_DIAGONAL_COST = 150;

export const DEFAULT_COSTS: Partial<Record<TileType, number>> = {
  [TileType.Grass]: 3,
  [TileType.Water]: 20,
  [TileType.Stone]: 4,
  [TileType.Wall]: 200,
  [TileType.Spore]: 2,
  [TileType.ElectricFence]: 10,
  [TileType.Fence]: 100,
  [TileType.Freezer]: 6,
  [TileType.Obstructed]: 3,
  [TileType.Bridge]: 5,
};

export const DEFAULT_MULTIPLIERS: Partial<Record<TileType, number>> = {
  [TileType.ElectricFence]: 20,
  [TileType.Freezer]: 0.5,
  [TileType.Obstructed]: 500,
};

export const defaultCostMultiplier = (tile: Tile) =>
  DEFAULT_MULTIPLIERS[tile.getType()] ?? 1;

// https://en.wikipedia.org/wiki/A*_search_algorithm
class Pathfinder {
  private costFn: (tile: Tile) => number | null;

  constructor(
    private surface: Surface,
    private costMultiplier = defaultCostMultiplier,
    costs:
      | Partial<Record<TileType, number>>
      | ((tile: Tile) => number | null) = DEFAULT_COSTS
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
      const costs: Array<number | null | undefined> = [];
      costs[0] = neighbors[0] ? this.costFn(neighbors[0]) : null;
      costs[1] = neighbors[1] ? this.costFn(neighbors[1]) : null;
      costs[2] = neighbors[2] ? this.costFn(neighbors[2]) : null;
      costs[3] = neighbors[3] ? this.costFn(neighbors[3]) : null;
      costs[4] =
        neighbors[4] && costs[0] && costs[1]
          ? this.getDiagonalCost(this.costFn(neighbors[4]), costs[0] + costs[1])
          : null;
      costs[5] =
        neighbors[5] && costs[0] && costs[2]
          ? this.getDiagonalCost(this.costFn(neighbors[5]), costs[0] + costs[2])
          : null;
      costs[6] =
        neighbors[6] && costs[1] && costs[3]
          ? this.getDiagonalCost(this.costFn(neighbors[6]), costs[1] + costs[3])
          : null;
      costs[7] =
        neighbors[7] && costs[2] && costs[3]
          ? this.getDiagonalCost(this.costFn(neighbors[7]), costs[2] + costs[3])
          : null;

      neighbors.forEach((neighbor, index) => {
        if (!neighbor) {
          return;
        }

        const cost = costs[index];
        if (!cost) {
          return;
        }

        const neighborHash = neighbor.getHash();
        const score =
          gScores.get(currentHash)! + cost * costMultiplier(neighbor);

        if (score < (gScores.get(neighborHash) ?? Infinity)) {
          const movementScore = movementScores.get(currentHash)! + cost;
          movementScores.set(neighborHash, movementScore);

          path.set(neighborHash, current);
          gScores.set(neighborHash, score);
          fScores.set(neighborHash, score + this.heuristic(neighbor, to));

          // TODO: check if neighbor is not already in the active tiles?
          activeTiles.push(neighbor);
        }
      });
    }
  }

  getHivePath(tiles: Tile[], to: Tile) {
    const visitedTiles: Record<string, number> = {};

    const multiplierFn = (tile: Tile) => {
      return (
        (visitedTiles[tile.getHash()] ?? 1) *
        (DEFAULT_MULTIPLIERS[tile.getType()] ?? 1)
      );
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

    return this.getDiagonalCost(
      cost,
      this.costFn(this.surface.getTile(from.getX(), to.getY())!)! +
        this.costFn(this.surface.getTile(to.getX(), from.getY())!)!
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

  private getDiagonalCost = (cost: number | null, diagonalCosts = 0) => {
    if (isNaN(diagonalCosts) || diagonalCosts > MAX_DIAGONAL_COST) {
      return null;
    }

    if (!cost) {
      return null;
    }

    return cost + diagonalCosts / 4;
  };
}

export default Pathfinder;
