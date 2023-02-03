import { Sprite } from "pixi.js";
import { Agent } from "../../../data/entity/entity";
import { PROJECTILES } from "../layer";
import { SCALE } from "../constants";
import { EntityRenderer } from "./types";
import { EntityType } from "../../../data/entity/constants";
import { AssetsContainer } from "../assets/container";

const ATLAS_NAME = "projectiles";
const DEFAULT_SPRITE = "projectiles0.png";
const ENTITY_TO_ATLAS_MAP = new Map<EntityType, string>([
  [EntityType.Bullet, "projectiles0.png"],
  [EntityType.Flame, "projectiles1.png"],
  [EntityType.Rocket, "projectiles2.png"],
  [EntityType.Shockwave, "projectiles5.png"],
]);

class GenericProjectile extends Sprite implements EntityRenderer {
  public static readonly layer = PROJECTILES;

  constructor(protected data: Agent, container: AssetsContainer) {
    super(
      container.assets![ATLAS_NAME].textures[
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
