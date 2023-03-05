import { Sprite } from "pixi.js";
import { Agent } from "../../../data/entity/entity";
import { BASE } from "../layer";
import { SCALE } from "../constants";
import { EntityRenderer } from "./types";
import { BASE_ENTITIES, EntityType } from "../../../data/entity/constants";
import { AssetsContainer } from "../assets/container";
import Manager from "../../../data/controllers/manager";
import { ATLAS, AtlasTile } from "../atlas";

class Base extends Sprite implements EntityRenderer {
  public static readonly layer = BASE;

  private static neighbors = [
    [0, -2],
    [2, 0],
    [0, 2],
    [-2, 0],
  ];

  private static entityToAtlasMap = new Map<EntityType, string>([
    [EntityType.Base, AtlasTile.Base],
    [EntityType.Armory, AtlasTile.Barracks],
    [EntityType.Barracks, AtlasTile.Barracks],
    [EntityType.PowerPlant, AtlasTile.PowerPlant],
    [EntityType.Radar, AtlasTile.Radar],
    [EntityType.Market, AtlasTile.Market],
  ]);

  private _x: number;
  private _y: number;

  constructor(data: Agent, private container: AssetsContainer) {
    super();

    this._x = data.entity.getAlignedX();
    this._y = data.entity.getAlignedY();

    const texture = Base.entityToAtlasMap.get(data.getType());
    if (texture) {
      const icon = new Sprite(this.container.assets![ATLAS].textures[texture]);
      icon.anchor.set(0.5);
      icon.position.set(SCALE, SCALE);
      this.addChild(icon);
    }

    this.position.set(this._x * SCALE, this._y * SCALE);
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
    let index = "base-";

    for (let i = 0; i < 4; i++) {
      const neighbor = surface.getTile(
        this._x + Base.neighbors[i][0],
        this._y + Base.neighbors[i][1]
      );

      index +=
        neighbor?.hasStaticEntity() &&
        BASE_ENTITIES.has(neighbor.getStaticEntity().getAgent().getType())
          ? "0"
          : "1";
    }

    this.texture = this.container.assets![ATLAS].textures[index];
  }
}

export { Base };
