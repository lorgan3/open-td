import { Loader, Sprite } from "pixi.js";
import { EntityRenderer } from ".";

import { Agent, EntityType } from "../../../data/entity/entity";
import { SCALE } from "../renderer";

export const ATLAS_NAME = "buildings";
const DEFAULT_SPRITE = "buildings0.png";
const ENTITY_TO_ATLAS_MAP = new Map<EntityType, string>([
  [EntityType.Base, "buildings0.png"],
  [EntityType.Armory, "buildings1.png"],
  [EntityType.PowerPlant, "buildings2.png"],
  [EntityType.Radar, "buildings3.png"],
  [EntityType.Market, "buildings4.png"],
  [EntityType.DamageBeacon, "buildings5.png"],
  [EntityType.SpeedBeacon, "buildings6.png"],
  [EntityType.Freezer, "buildings12.png"],
]);

class Default extends Sprite implements EntityRenderer {
  constructor(private data: Agent, loader: Loader) {
    super(
      loader.resources[ATLAS_NAME].spritesheet!.textures[
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
