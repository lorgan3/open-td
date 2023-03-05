import { Sprite } from "pixi.js";
import { Agent } from "../../../data/entity/entity";
import { PROJECTILES } from "../layer";
import { SCALE } from "../constants";
import { EntityRenderer } from "./types";
import { EntityType } from "../../../data/entity/constants";
import { AssetsContainer } from "../assets/container";
import { ATLAS, AtlasTile } from "../atlas";

const DEFAULT_SPRITE = AtlasTile.Bullet;
const ENTITY_TO_ATLAS_MAP = new Map<EntityType, string>([
  [EntityType.Bullet, AtlasTile.Bullet],
  [EntityType.Flame, AtlasTile.Fire],
  [EntityType.Rocket, AtlasTile.Rocket],
  [EntityType.Shockwave, AtlasTile.Shockwave],
]);

class GenericProjectile extends Sprite implements EntityRenderer {
  public static readonly layer = PROJECTILES;

  constructor(protected data: Agent, container: AssetsContainer) {
    super(
      container.assets![ATLAS].textures[
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

export { GenericProjectile };
