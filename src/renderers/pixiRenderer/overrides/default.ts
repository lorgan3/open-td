import { Sprite } from "pixi.js";
import { Agent } from "../../../data/entity/entity";
import { BASE } from "../layer";
import { SCALE } from "../constants";
import { EntityRenderer } from "./types";
import { EntityType } from "../../../data/entity/constants";
import { AssetsContainer } from "../assets/container";
import { ATLAS, AtlasTile } from "../atlas";

const DEFAULT_SPRITE = "base-1111";
const ENTITY_TO_ATLAS_MAP = new Map<EntityType, string>([
  [EntityType.DamageBeacon, AtlasTile.DamageBeacon],
  [EntityType.SpeedBeacon, AtlasTile.SpeedBeacon],
  [EntityType.Freezer, AtlasTile.Tar],
]);

class Default extends Sprite implements EntityRenderer {
  public static readonly layer = BASE;

  constructor(private data: Agent, container: AssetsContainer) {
    super(
      container.assets![ATLAS].textures[
        ENTITY_TO_ATLAS_MAP.get(data.getType()) ?? DEFAULT_SPRITE
      ]
    );
  }

  sync() {
    this.position.set(
      this.data.entity.getX() * SCALE,
      this.data.entity.getY() * SCALE
    );
    this.angle = this.data.entity.getRotation();
  }
}

export { Default };
