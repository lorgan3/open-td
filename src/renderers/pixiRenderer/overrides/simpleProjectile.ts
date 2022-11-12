import { Loader, Sprite } from "pixi.js";
import { EntityRenderer } from ".";

import { Agent, EntityType } from "../../../data/entity/entity";
import { SCALE } from "../renderer";

const ATLAS_NAME = "projectiles";
const DEFAULT_SPRITE = "Projectiles0.png";
const ENTITY_TO_ATLAS_MAP = new Map<EntityType, string>([
  [EntityType.Bullet, "Projectiles0.png"],
  [EntityType.Flame, "Projectiles1.png"],
  [EntityType.Rocket, "Projectiles2.png"],
  [EntityType.Shockwave, "Projectiles5.png"],
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
      (this.data.entity.getX() + 0.5) * SCALE,
      (this.data.entity.getY() + 0.5) * SCALE
    );
    this.angle = this.data.entity.getRotation();
  }
}

export { SimpleProjectile };
