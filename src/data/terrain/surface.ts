import Entity, { Agent, AgentCategory } from "../entity/entity";
import Manager from "../manager";
import { Generator } from "./generator";
import Tile from "./tile";
import { GameEvent } from "../events";

class Surface {
  public map!: Tile[];
  public entities: Entity[] = [];
  public deletedEntities: Entity[] = [];
  public staticEntities: Entity[] = [];
  private entitiesMap = new Map<AgentCategory, Set<Entity>>();

  private dirty = false;

  constructor(
    private width = 50,
    private height = 25,
    private generate: Generator = (x, y) => new Tile(x, y)
  ) {
    this.initialize();
  }

  private initialize() {
    this.map = new Array(this.width * this.height);
    for (let j = 0; j < this.height; j++) {
      for (let i = 0; i < this.width; i++) {
        this.map[j * this.width + i] = this.generate(i, j);
      }
    }

    this.entities = [];
    this.deletedEntities = [];
    this.staticEntities = [];
    this.entitiesMap.clear();

    Object.values(AgentCategory)
      .filter((value): value is AgentCategory => typeof value !== "string")
      .forEach((category) => this.entitiesMap.set(category, new Set()));
  }

  public getTile(x: number, y: number, clamp = false): Tile | undefined {
    if (x >= this.width || x < 0 || y >= this.height || y < 0) {
      if (clamp) {
        return this.getTile(
          Math.max(Math.min(x, this.width - 1), 0),
          Math.max(Math.min(y, this.height - 1), 0)
        );
      }

      return undefined;
    }

    return this.map[y * this.width + x];
  }

  public setTile(tile: Tile) {
    this.dirty = true;
    const originalTile = this.setTileInternal(tile);

    Manager.Instance?.triggerEvent(GameEvent.SurfaceChange, {
      affectedTiles: [originalTile],
    });
  }

  public setTiles(tiles: Tile[]) {
    this.dirty = true;
    const originalTiles = tiles.map((tile) => this.setTileInternal(tile));

    Manager.Instance?.triggerEvent(GameEvent.SurfaceChange, {
      affectedTiles: originalTiles,
    });
  }

  private setTileInternal(tile: Tile) {
    const originalTile = this.map[tile.getY() * this.width + tile.getX()];

    if (originalTile.hasStaticEntity()) {
      this.despawnStatic(originalTile.getStaticEntity()!.getAgent());
    }

    tile["towers"] = originalTile["towers"];
    tile["discovered"] = originalTile["discovered"];
    this.map[tile.getY() * this.width + tile.getX()] = tile;

    return originalTile;
  }

  public getRow(y: number) {
    const offset = y * this.width;
    return this.map.slice(offset, offset + this.width);
  }

  public getColumn(x: number) {
    const column: Tile[] = new Array(this.height);
    for (let i = 0; i < this.height; i++) {
      column[i] = this.getTile(x, i)!;
    }
    return column;
  }

  public getWidth() {
    return this.width;
  }

  public getHeight() {
    return this.height;
  }

  public forLine(
    sourceX: number,
    sourceY: number,
    targetX: number,
    targetY: number,
    fn: (tile: Tile, index: number) => void | boolean,
    connected = false
  ) {
    const direction = Math.atan2(targetY - sourceY, targetX - sourceX);
    return this.forRay(
      sourceX,
      sourceY,
      direction,
      (tile: Tile, index: number) => {
        const done = fn(tile, index) === false;
        return !done && !(tile.getX() === targetX && tile.getY() === targetY);
      },
      connected
    );
  }

  public forRay(
    sourceX: number,
    sourceY: number,
    direction: number,
    fn: (tile: Tile, index: number) => boolean,
    connected = false
  ) {
    // Determine the direction of the line
    const xDiff = Math.cos(direction);
    const yDiff = Math.sin(direction);

    // Determine the step size so that every loop at least one direction changes by 1
    const sum = Math.abs(xDiff) + Math.abs(yDiff);
    let xStep = Math.abs(xDiff / sum);
    let yStep = Math.abs(yDiff / sum);

    let ratio = 1 + (xStep > yStep ? yStep / xStep : xStep / yStep);
    xStep *= ratio * Math.sign(xDiff);
    yStep *= ratio * Math.sign(yDiff);

    let prevX: number | undefined;
    let prevY: number | undefined;

    let i = 0;
    while (true) {
      let skip = false;
      const x = Math.round(sourceX);
      let y = Math.round(sourceY);

      if (
        connected &&
        prevX !== undefined &&
        Math.round(prevX) !== x &&
        Math.round(prevY!) !== y
      ) {
        y = Math.round(prevY!);
        skip = true;
      }

      const tile = this.getTile(x, y);

      if (!tile) {
        break;
      }

      if (!fn(tile, i)) {
        break;
      }

      if (!skip) {
        sourceX += xStep;
        sourceY += yStep;
      }

      prevX = x;
      prevY = y;
      i++;
    }
  }

  // TODO: constrain the coordinates to the surface dimensions to prevent useless loops?
  // TODO: is it worth it to process the tiles in order instead of always going top left to bottom right?
  public forRect(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    fn: (tile: Tile) => void
  ) {
    const runFn = (x: number, y: number) => {
      const tile = this.getTile(x, y);
      if (tile) {
        fn(tile);
      }
    };

    const horizontalLoop = (y: number) => {
      if (x2 > x1) {
        for (let x = x1; x <= x2; x++) {
          runFn(x, y);
        }
      } else {
        for (let x = x1; x >= x2; x--) {
          runFn(x, y);
        }
      }
    };

    if (y2 > y1) {
      for (let y = y1; y <= y2; y++) {
        horizontalLoop(y);
      }
    } else {
      for (let y = y1; y >= y2; y--) {
        horizontalLoop(y);
      }
    }
  }

  public forCircle(
    x: number,
    y: number,
    d: number,
    fn: (tile: Tile) => void,
    edgeOnly = false
  ) {
    let r = d / 2;
    const rSquared = r * r;
    const innerRSquared = (r - 1) * (r - 1);

    const runFn = (cx: number, cy: number, offset = 0) => {
      const ocx = cx + offset;
      const ocy = cy + offset;
      const dist = ocx * ocx + ocy * ocy;
      if (dist < rSquared && !(edgeOnly && dist < innerRSquared)) {
        // @TODO: it is possible this calls the function for the same tile multiple times out of bounds in edgeOnly mode
        // edgeOnly mode might also behave unexpectedly when the center is out of bounds
        const tile = this.getTile(x + cx, y + cy, edgeOnly);
        if (tile) {
          fn(tile);
        }
      }
    };

    if (d % 2 === 0) {
      for (let cy = -r; cy < r; cy++) {
        for (let cx = -r; cx < r; cx++) {
          runFn(cx, cy, 0.5);
        }
      }
    } else {
      r = r | 0;
      for (let cy = -r; cy < r + 1; cy++) {
        for (let cx = -r; cx < r + 1; cx++) {
          runFn(cx, cy);
        }
      }
    }
  }

  public spawn(agent: Agent) {
    this.entities.push(agent.entity);
    this.entitiesMap.get(agent.category)!.add(agent.entity);

    if (agent.spawn) {
      agent.spawn();
    }
  }

  public spawnStatic(agent: Agent) {
    const tile = this.getTile(agent.entity.getX() | 0, agent.entity.getY() | 0);
    tile!.setStaticEntity(agent.entity);
    this.spawn(agent);
    this.dirty = true;
  }

  public despawn(agent: Agent) {
    const index = this.entities.indexOf(agent.entity);
    if (index >= 0) {
      this.entities.splice(index, 1);
    }

    this.entitiesMap.get(agent.category)!.delete(agent.entity);
    this.deletedEntities.push(agent.entity);

    if (agent.despawn) {
      agent.despawn();
    }
  }

  public despawnStatic(agent: Agent) {
    const tile = this.getTile(agent.entity.getX() | 0, agent.entity.getY() | 0);
    tile!.clearStaticEntity();
    this.despawn(agent);
    this.dirty = true;
  }

  public getEntities() {
    return this.entities;
  }

  public getEntitiesForCategory(category: AgentCategory) {
    return this.entitiesMap.get(category)!;
  }

  public getDeletedEntities() {
    return this.deletedEntities;
  }

  public getStaticEntities() {
    return this.staticEntities;
  }

  public markPristine() {
    this.dirty = false;
    this.deletedEntities = [];
  }

  public isDirty() {
    return this.dirty;
  }
}

export default Surface;
