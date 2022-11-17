import { Loader, Sprite } from "pixi.js";
import { EntityRenderer } from ".";

import { Agent, EntityType } from "../../../data/entity/entity";
import { SCALE } from "../renderer";

const ATLAS_NAME = "projectiles";
const DEFAULT_SPRITE = "projectiles0.png";
const ENTITY_TO_ATLAS_MAP = new Map<EntityType, string>([
  [EntityType.Bullet, "projectiles0.png"],
  [EntityType.Flame, "projectiles1.png"],
  [EntityType.Rocket, "projectiles2.png"],
  [EntityType.Shockwave, "projectiles5.png"],
]);

class SimpleProjectile extends Sprite implements EntityRenderer {
  constructor(private data: Agent, loader: Loader) {
    super(
      loader.resources[ATLAS_NAME].spritesheet!.textures[
        ENTITY_TO_ATLAS_MAP.get(data.getType()) ?? DEFAULT_SPRITE
      ]
    );
    this.pivot = { x: 8, y: 8 };
  }

  sync() {
    this.position.set(
      this.data.entity.getX() * SCALE,
      this.data.entity.getY() * SCALE
    );
    this.angle = this.data.entity.getRotation();
  }
}

export { SimpleProjectile };
