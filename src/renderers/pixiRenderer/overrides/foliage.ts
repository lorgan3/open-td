import { Sprite } from "pixi.js";
import { Agent } from "../../../data/entity/entity";
import { FOLIAGE } from "../layer";
import { EntityRenderer } from "./types";
import { EntityType } from "../../../data/entity/constants";
import { AssetsContainer } from "../assets/container";
import { SCALE } from "../constants";

class Foliage extends Sprite implements EntityRenderer {
  public static readonly layer = FOLIAGE;

  private static atlas = "foliage";

  private static entityMap = new Map<EntityType, string>([
    [EntityType.Tree, "foliage0.png"],
    [EntityType.Stump, "foliage2.png"],
    [EntityType.Rock, "foliage5.png"],
  ]);

  static verticalOffset = -0.5;

  constructor(data: Agent, container: AssetsContainer) {
    super(
      container.assets![Foliage.atlas].textures[
        Foliage.entityMap.get(data.getType())!
      ]
    );

    this.position.set(
      data.entity.getX() * SCALE,
      (data.entity.getY() + Foliage.verticalOffset) * SCALE
    );
  }

  sync() {}
}

export { Foliage };
