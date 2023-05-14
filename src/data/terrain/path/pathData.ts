import { SurfaceSchema } from "../surface";
import Tile, { SerializedTile } from "../tile";
import Path from "./path";
import Pathfinder from "./pathfinder";
import { WorkerEvent } from "./worker";
import Worker from "./worker?worker";

class PathData {
  private paths?: Path[];
  private promise?: Promise<Path[]>;

  private worker?: Worker;

  constructor(
    private pathfinder: Pathfinder,
    private startPoints: Tile[],
    private target: Tile
  ) {}

  /**
   * Get the paths synchronously but do not block the main thread.
   * If the paths weren't calculated yet, this always returns an empty array.
   * @see getAsyncPaths if you need to be notified when the paths are available.
   * @see getPathsSync if you can't use polling or promises and need to get the path even if it blocks the main thread.
   */
  getPaths() {
    if (this.paths) {
      return this.paths;
    }

    if (!this.promise) {
      this.createPromise();
    }

    return [];
  }

  getAsyncPaths() {
    if (!this.promise) {
      this.createPromise();
    }

    return this.promise!;
  }

  getPathsSync() {
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

    this.promise = Promise.resolve(this.paths);
    return this.paths!;
  }

  private createPromise() {
    this.promise = new Promise((resolve) => {
      const surface = this.pathfinder.getSurface();
      const buffer = SurfaceSchema.serializeSurface(surface, false);

      const event: WorkerEvent = {
        buffer: buffer.buffer,
        costs: this.pathfinder.costs,
        costMultiplier: this.pathfinder.costMultipliers,
        scale: this.pathfinder.scale,
        startPoints: this.startPoints.map((tile) => tile.serialize()),
        target: this.target.serialize(),
      };

      this.worker = new Worker();
      this.worker.postMessage(event, [event.buffer]);
      this.worker.onmessage = ({ data }: MessageEvent<SerializedTile[][]>) => {
        this.paths = data.map((serializedTiles) =>
          Path.fromTiles(
            this.pathfinder,
            serializedTiles.map(({ x, y }) => surface.getTile(x, y)!)
          )
        );

        if (this.worker) {
          this.worker.terminate();
          this.worker = undefined;
        }

        resolve(this.paths);
      };
    });
  }

  update() {
    this.paths = undefined;
    this.promise = undefined;

    if (this.worker) {
      this.worker.terminate();
      this.worker = undefined;
    }
  }
}

export default PathData;
