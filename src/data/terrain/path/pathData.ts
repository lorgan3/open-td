import Tile from "../tile";
import Path from "./path";
import Pathfinder from "./pathfinder";

class PathData {
  private paths?: Path[];

  constructor(
    private pathfinder: Pathfinder,
    private startPoints: Tile[],
    private target: Tile
  ) {}

  getPaths() {
    if (!this.paths) {
      const updatedStartPoints = this.startPoints.map(
        (point) =>
          this.pathfinder.getSurface().getTile(point.getX(), point.getY())!
      );
      const updatedTarget = this.pathfinder
        .getSurface()
        .getTile(this.target.getX(), this.target.getY())!;

      this.paths = this.pathfinder
        .getHivePath(updatedStartPoints, updatedTarget)
        .filter((path): path is Path => !!path);
    }

    return this.paths!;
  }

  update() {
    this.paths = undefined;
  }
}

export default PathData;
