import Entity, { Agent } from "../entity/entity";
import { Generator } from "./generator";
import Tile from "./tile";
import { GameEvent } from "../events";
import StaticEntity, { getScale, StaticAgent } from "../entity/staticEntity";
import { AgentCategory, EntityType } from "../entity/constants";
import EventSystem from "../eventSystem";
import { getRange, isTower, ITower } from "../entity/towers";

export interface GeneratorParams {
  width: number;
  height: number;
  generate?: Generator;
}

const ADJACENT_COORDINATES: Array<[number, number]> = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const MATRIX_COORDINATES: Array<[number, number]> = [
  ...ADJACENT_COORDINATES,
  [1, 1],
  [-1, -1],
  [-1, 1],
  [1, -1],
];

export class SurfaceSchema {
  private static propertyCount = 3;
  private tileBufferSize;

  constructor(
    public readonly buffer: Uint8Array,
    public staticEntityConstructor?: (
      type: EntityType,
      tile: Tile
    ) => StaticEntity | null
  ) {
    this.tileBufferSize = this.withEntities ? 2 : 1;
  }

  get width() {
    return this.buffer[0];
  }

  get height() {
    return this.buffer[1];
  }

  get withEntities() {
    return this.buffer[2];
  }

  getTile(index: number) {
    const offset = SurfaceSchema.propertyCount + index * this.tileBufferSize;
    const tile = new Tile(
      index % this.width,
      Math.floor(index / this.width),
      this.buffer[offset]
    );

    if (this.withEntities && this.staticEntityConstructor) {
      const entity = this.staticEntityConstructor(
        this.buffer[offset + 1],
        tile
      );

      if (entity) {
        tile.setStaticEntity(entity);
      }
    }

    return tile;
  }

  static serializeSurface(surface: Surface, withEntities: boolean) {
    const tileBufferSize = withEntities ? 2 : 1;
    const buffer = new Uint8Array(
      SurfaceSchema.propertyCount + surface.map.length * tileBufferSize
    );
    buffer[0] = surface.getWidth();
    buffer[1] = surface.getHeight();
    buffer[2] = withEntities ? 1 : 0;

    for (let i = 0; i < surface.map.length; i++) {
      const tile = surface.map[i];
      const index = i * tileBufferSize + SurfaceSchema.propertyCount;
      buffer[index] = withEntities ? tile.getAltType() : tile.getType();

      if (withEntities) {
        const agent =
          tile.hasStaticEntity() &&
          tile.getStaticEntity().getAgent().getTile() === tile
            ? tile.getStaticEntity().getAgent()
            : null;

        buffer[index + 1] = agent?.getType() ?? EntityType.None;
      }
    }

    return buffer;
  }
}

class Surface {
  public map!: Tile[];
  public entities: Entity[] = [];
  public deletedEntities: Entity[] = [];
  public tickingEntities: Entity[] = [];
  private entitiesMap = new Map<AgentCategory, Set<Entity>>();
  private towers = new Set<ITower>();

  private width: number;
  private height: number;

  private dirty = false;
  private _version = 0;
  private changedTiles = new Set<Tile>();
  private addedAgents = new Set<StaticAgent>();
  private removedAgents = new Set<StaticAgent>();
  private initialized = false;

  constructor(params: GeneratorParams | SurfaceSchema) {
    this.width = params.width;
    this.height = params.height;

    const generatorOrSchema =
      params instanceof SurfaceSchema ? params : params.generate;

    this.initialize(generatorOrSchema ?? ((x, y) => new Tile(x, y)));
    this.initialized = true;
  }

  serialize(withEntities: boolean): SurfaceSchema {
    return new SurfaceSchema(
      SurfaceSchema.serializeSurface(this, withEntities)
    );
  }

  private initialize(generateOrSchema: Generator | SurfaceSchema) {
    this.entities = [];
    this.deletedEntities = [];
    this.entitiesMap.clear();

    Object.values(AgentCategory)
      .filter((value): value is AgentCategory => typeof value !== "string")
      .forEach((category) => this.entitiesMap.set(category, new Set()));
    this.map = new Array(this.width * this.height);

    const staticEntities: StaticEntity[] = [];
    if (generateOrSchema instanceof SurfaceSchema) {
      for (let i = 0; i < this.map.length; i++) {
        const tile = generateOrSchema.getTile(i);
        this.map[i] = tile;
        if (tile.hasStaticEntity()) {
          staticEntities.push(tile.getStaticEntity());
        }
      }
    } else {
      for (let j = 0; j < this.height; j++) {
        for (let i = 0; i < this.width; i++) {
          const tile = generateOrSchema(i, j);
          this.map[j * this.width + i] = tile;

          if (tile.hasStaticEntity()) {
            staticEntities.push(tile.getStaticEntity());
          }
        }
      }
    }

    for (let entity of staticEntities) {
      this.spawnStatic(entity.getAgent());
    }
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

  /** @TODO: Protect against invalid coordinates for the provided scale? */
  getEntityTiles(agent: StaticAgent): Tile[];
  getEntityTiles(x: number, y: number, scale: number): Tile[];
  getEntityTiles(agentOrx: StaticAgent | number, y?: number, scale?: number) {
    let x: number;

    if (y !== undefined) {
      x = agentOrx as number;
    } else {
      const agent = agentOrx as StaticAgent;
      x = agent.getTile().getX();
      y = agent.getTile().getY();
      scale = getScale(agent);
    }

    switch (scale) {
      case 1:
        return [this.map[y * this.width + x]];
      case 2:
        return [
          this.map[y * this.width + x],
          this.map[y * this.width + x + 1],
          this.map[(y + 1) * this.width + x],
          this.map[(y + 1) * this.width + x + 1],
        ];
      default:
        throw new Error("Unsupported agent scale!");
    }
  }

  public getAdjacentTiles(middle: Tile, scale = 1, diagonals = false) {
    return (diagonals ? MATRIX_COORDINATES : ADJACENT_COORDINATES)
      .map(([x, y]) =>
        this.getTile(middle.getX() + x * scale, middle.getY() + y * scale)
      )
      .filter((tile) => !!tile) as Tile[];
  }

  public setTile(tile: Tile) {
    this.setTileInternal(tile);
  }

  public setTiles(tiles: Tile[]) {
    tiles.map((tile) => this.setTileInternal(tile));
  }

  private setTileInternal(tile: Tile) {
    this.dirty = true;
    this._version++;

    const originalTile = this.map[tile.getY() * this.width + tile.getX()];

    if (originalTile.hasStaticEntity() && !tile.hasStaticEntity()) {
      tile.setStaticEntity(originalTile.getStaticEntity());
    } else if (originalTile.hasStaticEntity()) {
      this.despawnStatic(originalTile.getStaticEntity().getAgent());
    }

    tile.sync(originalTile);
    this.map[tile.getY() * this.width + tile.getX()] = tile;
    this.changedTiles.add(originalTile);

    return originalTile;
  }

  public processChangedTiles() {
    if (!this.changedTiles.size) {
      return;
    }

    EventSystem.Instance.triggerEvent(GameEvent.SurfaceChange, {
      affectedTiles: this.changedTiles,
      addedStaticAgents: this.addedAgents,
      removedStaticAgents: this.removedAgents,
    });

    this.changedTiles.clear();
    this.addedAgents.clear();
    this.removedAgents.clear();
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
    config?: {
      connected?: boolean;
      scale?: number;
    }
  ) {
    const scale = config?.scale ?? 1;
    sourceX = Math.floor(sourceX / scale) * scale;
    sourceY = Math.floor(sourceY / scale) * scale;
    targetX = Math.floor(targetX / scale) * scale;
    targetY = Math.floor(targetY / scale) * scale;
    const direction = Math.atan2(targetY - sourceY, targetX - sourceX);

    return this.forRay(
      sourceX,
      sourceY,
      direction,
      (tile: Tile, index: number) => {
        const done = fn(tile, index) === false;
        return !done && !(tile.getX() === targetX && tile.getY() === targetY);
      },
      config
    );
  }

  public forRay(
    sourceX: number,
    sourceY: number,
    direction: number,
    fn: (tile: Tile, index: number) => boolean,
    config?: {
      connected?: boolean;
      scale?: number;
    }
  ) {
    const connected = config?.connected ?? false;
    const scale = config?.scale ?? 1;

    // Determine the direction of the line
    const xDiff = Math.cos(direction);
    const yDiff = Math.sin(direction);

    // Determine the step size so that every loop at least one direction changes by 1
    const sum = Math.abs(xDiff) + Math.abs(yDiff);
    let xStep = Math.abs(xDiff / sum);
    let yStep = Math.abs(yDiff / sum);

    let ratio = (1 + (xStep > yStep ? yStep / xStep : xStep / yStep)) * scale;
    xStep *= ratio * Math.sign(xDiff);
    yStep *= ratio * Math.sign(yDiff);

    let prevX: number | undefined;
    let prevY: number | undefined;

    let i = 0;
    while (true) {
      let skip = false;
      const x = Math.round(sourceX / scale) * scale;
      let y = Math.round(sourceY / scale) * scale;

      if (
        connected &&
        prevX !== undefined &&
        Math.round(prevX / scale) * scale !== x &&
        Math.round(prevY! / scale) * scale !== y
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
    fn: (tile: Tile) => void,
    config?: {
      scale?: number;
    }
  ) {
    const scale = config?.scale ?? 1;
    x1 = Math.floor(x1 / scale) * scale;
    y1 = Math.floor(y1 / scale) * scale;
    x2 = Math.floor(x2 / scale) * scale;
    y2 = Math.floor(y2 / scale) * scale;

    const runFn = (x: number, y: number) => {
      const tile = this.getTile(x, y);
      if (tile) {
        fn(tile);
      }
    };

    const horizontalLoop = (y: number) => {
      if (x2 > x1) {
        for (let x = x1; x <= x2; x += scale) {
          runFn(x, y);
        }
      } else {
        for (let x = x1; x >= x2; x -= scale) {
          runFn(x, y);
        }
      }
    };

    if (y2 > y1) {
      for (let y = y1; y <= y2; y += scale) {
        horizontalLoop(y);
      }
    } else {
      for (let y = y1; y >= y2; y -= scale) {
        horizontalLoop(y);
      }
    }
  }

  public forCircle(
    x: number,
    y: number,
    d: number,
    fn: (tile: Tile) => void,
    config?: {
      edgeOnly?: boolean;
      scale?: number;
    }
  ) {
    const edgeOnly = config?.edgeOnly ?? false;
    const scale = config?.scale ?? 1;

    x = Math.floor(x / scale);
    y = Math.floor(y / scale);

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
        const tile = this.getTile((x + cx) * scale, (y + cy) * scale, edgeOnly);
        if (tile) {
          fn(tile);
        }
      }
    };

    if (d % 2 === 0) {
      for (let cy = -r; cy < r; cy += 1) {
        for (let cx = -r; cx < r; cx += 1) {
          runFn(cx, cy, 0.5);
        }
      }
    } else {
      r = r | 0;
      for (let cy = -r; cy < r + 1; cy += 1) {
        for (let cx = -r; cx < r + 1; cx += 1) {
          runFn(cx, cy);
        }
      }
    }
  }

  public spawn(agent: Agent) {
    this.entities.push(agent.entity);
    this.entitiesMap.get(agent.category)!.add(agent.entity);

    if (agent.tick) {
      this.tickingEntities.push(agent.entity);
    } else {
      // @todo
      // Non ticking entities aren't drawn until a full sync occurs.
      // To fix this, new entities need to tick at least once.
      // Or just assume it doesn't happen that often and do a full update.
      this.dirty = true;
    }

    if (agent.spawn && this.initialized) {
      agent.spawn();
    }
  }

  public spawnStatic(agent: StaticAgent) {
    const tiles = this.getEntityTiles(agent);
    tiles.forEach((tile) => {
      tile.setStaticEntity(agent.entity);
      this.changedTiles.add(tile);
    });

    this.addedAgents.add(agent);
    this.spawn(agent);
    this.dirty = true;

    if (isTower(agent) && getRange(agent) > 1) {
      this.towers.add(agent);
    }
  }

  public despawn(agent: Agent) {
    const index = this.entities.indexOf(agent.entity);
    if (index >= 0) {
      this.entities.splice(index, 1);

      if (agent.tick) {
        this.tickingEntities.splice(
          this.tickingEntities.indexOf(agent.entity),
          1
        );
      }
    }

    const result = this.entitiesMap.get(agent.category)!.delete(agent.entity);
    this.deletedEntities.push(agent.entity);

    if (agent.despawn) {
      agent.despawn();
    }

    return result;
  }

  public despawnStatic(agent: StaticAgent) {
    const tiles = this.getEntityTiles(agent);
    tiles.forEach((tile) => {
      tile.clearStaticEntity();
      this.changedTiles.add(tile);
    });

    this.removedAgents.add(agent);
    this.despawn(agent);
    this.dirty = true;

    if (isTower(agent)) {
      this.towers.delete(agent);
    }
  }

  public getEntities() {
    return this.entities;
  }

  public getTickingEntities() {
    return this.tickingEntities;
  }

  public getEntitiesForCategory(category: AgentCategory) {
    return this.entitiesMap.get(category)!;
  }

  public getDeletedEntities() {
    return this.deletedEntities;
  }

  public getTowers() {
    return this.towers;
  }

  public getTiles() {
    return this.map;
  }

  public markPristine() {
    this.dirty = false;
    this.deletedEntities = [];
  }

  public forceRerender() {
    this.dirty = true;
  }

  public isDirty() {
    return this.dirty;
  }

  public get version() {
    return this._version;
  }
}

export default Surface;
