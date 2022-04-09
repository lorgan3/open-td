import Surface from "./surface";
import Tile, { TileType } from "./tile";
import Heap from "heap";

const NEIGHBORS = [
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [0, -1],
  [-1, 0],
  [1, 0],
  [0, 1],
];

export const DEFAULT_COSTS: Partial<Record<TileType, number>> = {
  [TileType.Grass]: 3,
  [TileType.Water]: 20,
  [TileType.Stone]: 4,
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
    // Cheapest path from n to start
    const gScores = new Map<string, number>();
    gScores.set(from.getHash(), 0);

    // Cheapest path from n to end
    const fScores = new Map<string, number>();
    fScores.set(from.getHash(), this.heuristic(from, to));

    const costFn =
      typeof costs === "function"
        ? costs
        : costs !== undefined
        ? (tile: Tile) => costs[tile.getType()]
        : (tile: Tile) => this.costs[tile.getType()];

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
        const realPath = [current];
        while (current !== from) {
          current = path.get(current.getHash())!;
          realPath.push(current);
        }
        return realPath.reverse();
      }

      const currentHash = current.getHash();
      NEIGHBORS.forEach(([x, y], index) => {
        const neighbor = this.surface.getTile(
          x + current.getX(),
          y + current.getY()
        );

        if (!neighbor) {
          return;
        }

        const cost = costFn(neighbor);
        if (!cost) {
          return;
        }

        const neighborHash = neighbor.getHash();
        const score = gScores.get(currentHash)! + (index > 3 ? 1 : 1.5) * cost; // Diagonals are 1.5 times as expensive

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

    return tiles.reduce<Array<Tile[] | undefined>>((paths, from, i) => {
      const path = this.getPath(from, to, costFn);
      paths.push(path);

      if (path && tiles.length > i - 1) {
        path.forEach(
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
}

export default Pathfinder;
