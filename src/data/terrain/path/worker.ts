import { TileType } from "../constants";
import Surface from "../surface";
import { SerializedTile } from "../tile";
import Path from "./path";
import Pathfinder from "./pathfinder";

export interface WorkerEvent {
  width: number;
  height: number;
  buffer: ArrayBuffer;
  costMultiplier: Partial<Record<TileType, number>>;
  costs: Partial<Record<TileType, number>>;
  startPoints: SerializedTile[];
  target: SerializedTile;
}

onmessage = ({
  data: { width, height, buffer, costMultiplier, costs, startPoints, target },
}: MessageEvent<WorkerEvent>) => {
  const surface = new Surface({
    width,
    height,
    buffer: new Uint8Array(buffer),
  });
  const pathfinder = new Pathfinder(surface, costMultiplier, costs);

  const startTiles = startPoints.map(({ x, y }) => surface.getTile(x, y)!);
  const targetTile = surface.getTile(target.x, target.y)!;

  const paths = pathfinder
    .getHivePath(startTiles, targetTile)
    .filter((path): path is Path => !!path);

  const serializedPaths = paths.map((path) =>
    path.getTiles().map((tile) => tile.serialize())
  );

  postMessage(serializedPaths);
};
