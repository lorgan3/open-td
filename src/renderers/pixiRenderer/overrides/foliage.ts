import { Sprite } from "pixi.js";
import { Agent } from "../../../data/entity/entity";
import { FOLIAGE } from "../layer";
import { EntityRenderer } from "./types";
import { EntityType, TreeType } from "../../../data/entity/constants";
import { AssetsContainer } from "../assets/container";
import { SCALE } from "../constants";
import { FallingTree } from "../fallingTree";

class Foliage extends Sprite implements EntityRenderer {
  public static readonly layer = FOLIAGE;

  private static atlas = "foliage";

  private static entityMap = new Map<EntityType, string[]>([
    [EntityType.Tree, ["foliage1.png", "foliage0.png", "foliage3.png"]],
    [EntityType.Stump, ["foliage2.png"]],
    [EntityType.Rock, ["foliage5.png", "foliage7.png"]],
  ]);

  static verticalOffset = -0.5;

  constructor(data: Agent, container: AssetsContainer) {
    super(
      container.assets![Foliage.atlas].textures[
        Foliage.entityMap.get(data.getType())![data.renderData.subType || 0]
      ]
    );

    this.position.set(
      data.entity.getX() * SCALE,
      (data.entity.getY() + Foliage.verticalOffset) * SCALE
    );

    this.on("removed", () => {
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
