import { Sprite } from "pixi.js";
import { Agent } from "../../../data/entity/entity";
import { STATIC } from "../layer";
import { EntityRenderer } from "./types";
import { EntityType } from "../../../data/entity/constants";
import { AssetsContainer } from "../assets/container";
import Manager from "../../../data/controllers/manager";
import { getScale, StaticAgent } from "../../../data/entity/staticEntity";
import { TileType } from "../../../data/terrain/constants";
import { SCALE } from "../constants";
import { ATLAS } from "../atlas";

class Wall extends Sprite implements EntityRenderer {
  public static readonly layer = STATIC;

  private static entityMap = new Map<EntityType, string>([
    [EntityType.Wall, "wall-"],
    [EntityType.Fence, "fence-"],
    [EntityType.ElectricFence, "fence-"],
  ]);

  /**
   * All neighbors going clockwise, starting with directly above.
   */
  private static neighbors = [
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1],
  ];

  static padding = 4;

  static types = new Set([
    TileType.Fence,
    TileType.Wall,
    TileType.ElectricFence,
  ]);

  private _x: number;
  private _y: number;
  private entityScale: number;
  private prefix: string;

  constructor(data: Agent, private container: AssetsContainer) {
    super();

    this._x = data.entity.getAlignedX();
    this._y = data.entity.getAlignedY();
    this.entityScale = getScale(data as StaticAgent);
    this.prefix = Wall.entityMap.get(data.getType())!;

    this.position.set(
      this._x * SCALE - Wall.padding * this.entityScale,
      this._y * SCALE - Wall.padding * this.entityScale
    );
    this.updateTexture();
  }

  sync(_: number, full: boolean) {
    if (!full) {
      return;
    }

    this.updateTexture();
  }

  private updateTexture() {
    const surface = Manager.Instance.getSurface();
    const wall = new Array<string>(8);

    // Cardinal neighbors
    for (let i = 0; i < 8; i += 2) {
      const neighbor = surface.getTile(
        this._x + Wall.neighbors[i][0] * this.entityScale,
        this._y + Wall.neighbors[i][1] * this.entityScale
      );

      wall[i] =
        neighbor &&
        Wall.types.has(neighbor.getType()) &&
        getScale(neighbor.getStaticEntity()!.getAgent()) === this.entityScale
          ? "1"
          : "0";
    }

    // Diagonal neighbors
    for (let i = 1; i < 8; i += 2) {
      if (wall[(i + 1) % 8] === "1" || wall[(i + 7) % 8] === "1") {
        wall[i] = "0";
        continue;
      }

      const neighbor = surface.getTile(
        this._x + Wall.neighbors[i][0] * this.entityScale,
        this._y + Wall.neighbors[i][1] * this.entityScale
      );

      wall[i] =
        neighbor &&
        Wall.types.has(neighbor.getType()) &&
        getScale(neighbor.getStaticEntity()!.getAgent()) === this.entityScale
          ? "1"
          : "0";
    }

    this.texture =
      this.container.assets![ATLAS].textures[this.prefix + wall.join("")];
  }
}

export { Wall };
