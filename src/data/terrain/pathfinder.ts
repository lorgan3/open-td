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

const DEFAULT_COSTS: Partial<Record<TileType, number>> = {
  [TileType.Grass]: 1,
  [TileType.Water]: 10,
  [TileType.Stone]: 2,
};

// https://en.wikipedia.org/wiki/A*_search_algorithm
class PathFinder {
  constructor(
    private surface: Surface,
    private costs: Partial<Record<TileType, number>> = DEFAULT_COSTS
  ) {}

  getPath(from: Tile, to: Tile) {
    // Cheapest path from n to start
    const gScores = new Map<string, number>();
    gScores.set(from.getHash(), 0);

    // Cheapest path from n to end
    const fScores = new Map<string, number>();
    fScores.set(from.getHash(), this.heuristic(from, to));

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
        return realPath;
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

        const cost = this.costs[neighbor.getType()];
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

  // Just manhattan for now
  private heuristic(from: Tile, to: Tile) {
    return (
      Math.abs(from.getX() - to.getX()) + Math.abs(from.getY() - to.getY())
    );
  }
}

export default PathFinder;
