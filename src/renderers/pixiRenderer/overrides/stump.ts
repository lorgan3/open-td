import { Sprite } from "pixi.js";
import { Agent } from "../../../data/entity/entity";
import { STATIC } from "../layer";
import { EntityRenderer } from "./types";
import { AssetsContainer } from "../assets/container";
import { SCALE } from "../constants";
import { ATLAS, AtlasTile } from "../atlas";

class Stump extends Sprite implements EntityRenderer {
  public static readonly layer = STATIC;

  static verticalOffset = -0.5;

  constructor(data: Agent, container: AssetsContainer) {
    super(container.assets![ATLAS].textures[AtlasTile.Stump]);

    this.position.set(
      data.entity.getX() * SCALE,
      (data.entity.getY() + Stump.verticalOffset) * SCALE
    );
  }

  sync() {}
}

export { Stump };
