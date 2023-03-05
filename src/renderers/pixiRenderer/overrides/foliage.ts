import { Sprite } from "pixi.js";
import { Agent } from "../../../data/entity/entity";
import { FOLIAGE } from "../layer";
import { EntityRenderer } from "./types";
import { EntityType, TreeType } from "../../../data/entity/constants";
import { AssetsContainer } from "../assets/container";
import { SCALE } from "../constants";
import { FallingTree } from "../fallingTree";
import { ATLAS, AtlasTile } from "../atlas";

class Foliage extends Sprite implements EntityRenderer {
  public static readonly layer = FOLIAGE;

  private static entityMap = new Map<EntityType, string[]>([
    [EntityType.Tree, [AtlasTile.Tree, AtlasTile.Pine, AtlasTile.Cactus]],
    [EntityType.Stump, [AtlasTile.Stump]],
    [EntityType.Rock, [AtlasTile.Rock, AtlasTile.RockAlt]],
  ]);

  static verticalOffset = -0.5;

  constructor(data: Agent, container: AssetsContainer) {
    super(
      container.assets![ATLAS].textures[
        Foliage.entityMap.get(data.getType())![data.renderData.subType || 0]
      ]
    );

    this.position.set(
      data.entity.getX() * SCALE,
      (data.entity.getY() + Foliage.verticalOffset) * SCALE
    );

    this.on("removed", () => {
      if (!this.visible) {
        return;
      }

      if (
        data.getType() === EntityType.Tree &&
        data.renderData.subType !== TreeType.Cactus
      ) {
        new FallingTree(this.texture, data.entity.getX(), data.entity.getY());
      }
    });
  }

  sync() {}
}

export { Foliage };
