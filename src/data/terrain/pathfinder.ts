import Surface from "./surface";
import Tile, { TileType } from "./tile";
import Heap from "heap";
import Path from "./path";

const NEIGHBORS = [
  [0, -1],
  [-1, 0],
  [1, 0],
  [0, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
];

export const DEFAULT_COSTS: Partial<Record<TileType, number>> = {
  [TileType.Grass]: 3,
  [TileType.Water]: 20,
  [TileType.Stone]: 4,
  [TileType.Wall]: 100,
};

// https://en.wikipedia.org/wiki/A*_search_algorithm
class Pathfinder {
  constructor(
    private surface: Surface,
    private costs: Partial<Record<TileType, number>> = DEFAULT_COSTS
  ) {}

  getPath(
    from: Tile,
    to: Tile,
    costs?: Partial<Record<TileType, number>> | ((tile: Tile) => number | null)
  ) {
    const costFn =
      typeof costs === "function"
        ? costs
        : costs !== undefined
        ? (tile: Tile) => costs[tile.getType()]
        : (tile: Tile) => this.costs[tile.getType()];

    // Cheapest path from n to start
    const score = costFn(from) ?? 1;
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
        return Path.fromMapAndCosts(from, to, path, gScores);
      }

      const currentHash = current.getHash();

      const neighbors = NEIGHBORS.map(([x, y]) =>
        this.surface.getTile(x + current.getX(), y + current.getY())
      );

      // Unrolled for performance I guess
      const costs: Array<number | null | undefined> = [];
      costs[0] = neighbors[0] ? costFn(neighbors[0]) : null;
      costs[1] = neighbors[1] ? costFn(neighbors[1]) : null;
      costs[2] = neighbors[2] ? costFn(neighbors[2]) : null;
      costs[3] = neighbors[3] ? costFn(neighbors[3]) : null;
      costs[4] =
        neighbors[4] && costs[0] && costs[1]
          ? this.getCost(costFn, neighbors[4], costs[0] + costs[1])
          : null;
      costs[5] =
        neighbors[5] && costs[0] && costs[2]
          ? this.getCost(costFn, neighbors[5], costs[0] + costs[2])
          : null;
      costs[6] =
        neighbors[6] && costs[1] && costs[3]
          ? this.getCost(costFn, neighbors[6], costs[1] + costs[3])
          : null;
      costs[7] =
        neighbors[7] && costs[2] && costs[3]
          ? this.getCost(costFn, neighbors[7], costs[2] + costs[3])
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
        const score = gScores.get(currentHash)! + cost;

        if (score < (gScores.get(neighborHash) ?? Infinity)) {
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

    const costFn = (tile: Tile) => {
      const cost = this.costs[tile.getType()];
      return cost ? cost * (visitedTiles[tile.getHash()] ?? 1) : null;
    };

    return tiles.reduce<Array<Path | undefined>>((paths, from, i) => {
      const path = this.getPath(from, to, costFn);
      paths.push(path);

      if (path && tiles.length > i - 1) {
        path
          .getTiles()
          .forEach(
            (tile) =>
              (visitedTiles[tile.getHash()] =
                visitedTiles[tile.getHash()] + 0.1 || 1.1)
          );
      }

      return paths;
    }, []);
  }

  // Just manhattan for now
  private heuristic(from: Tile, to: Tile) {
    return (
      Math.abs(from.getX() - to.getX()) + Math.abs(from.getY() - to.getY())
    );
  }

  private getCost = (
    costFn: (tile: Tile) => number | null | undefined,
    tile: Tile,
    diagonalCosts = 0
  ) => {
    const cost = costFn(tile);
    if (!cost) {
      return null;
    }

    return cost + diagonalCosts / 4;
  };
}

export default Pathfinder;
