import { TilingSprite } from "pixi.js";
import RailData, { LIFETIME } from "../../../data/entity/projectiles/rail";
import { PROJECTILES } from "../layer";
import { SCALE } from "../constants";
import { EntityRenderer } from "./types";
import { AssetsContainer } from "../assets/container";

const ATLAS_NAME = "projectiles";
const SPRITE = "projectiles4.png";
const SPRITE_SCALE = 16;

class Rail extends TilingSprite implements EntityRenderer {
  public static readonly layer = PROJECTILES;

  constructor(private data: RailData, container: AssetsContainer) {
    super(
      container.assets![ATLAS_NAME].textures[SPRITE],
      SPRITE_SCALE,
      SPRITE_SCALE
    );
    this.pivot = { x: SPRITE_SCALE / 2, y: 0 };
  }

  sync() {
    const x = this.data.entity.getX();
    const y = this.data.entity.getY();

    const scale = Math.sqrt(
      (x - this.data.targetX) ** 2 + (y - this.data.targetY) ** 2
    );
    this.height = scale * SCALE;

    this.alpha = Math.min(1, 1 - this.data.time / LIFETIME + 0.1);

    this.position.set(
      this.data.entity.getX() * SCALE,
      this.data.entity.getY() * SCALE
    );
    this.angle = this.data.entity.getRotation() - 90;
  }
}

export { Rail };
