import { Loader, TilingSprite } from "pixi.js";
import { EntityRenderer } from ".";

import LaserBeamData, {
  LIFETIME,
} from "../../../data/entity/projectiles/laserBeam";
import { SCALE } from "../renderer";

const ATLAS_NAME = "projectiles";
const SPRITE = "Projectiles3.png";
const SPRITE_SCALE = 16;

class LaserBeam extends TilingSprite implements EntityRenderer {
  private tileOffset = 0;

  constructor(private data: LaserBeamData, loader: Loader) {
    super(
      loader.resources[ATLAS_NAME].spritesheet!.textures[SPRITE],
      SPRITE_SCALE,
      SPRITE_SCALE
    );
    this.pivot = { x: SPRITE_SCALE / 2, y: 0 };
  }

  sync() {
    this.tilePosition.y = this.tileOffset;
    this.tileOffset += 0.5;

    const x = this.data.entity.getX() + 0.5;
    const y = this.data.entity.getY() + 0.5;

    const scale = Math.sqrt(
      (x - this.data.targetX - 0.5) ** 2 + (y - this.data.targetY - 0.5) ** 2
    );
    this.height = scale * SCALE;

    this.alpha = Math.min(1, 1 - this.data.time / LIFETIME + 0.1);

    this.position.set(
      (this.data.entity.getX() + 0.5) * SCALE,
      (this.data.entity.getY() + 0.5) * SCALE
    );
    this.angle = this.data.entity.getRotation() - 90;
  }
}

export { LaserBeam };
