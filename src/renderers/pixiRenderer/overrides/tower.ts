import { AnimatedSprite, Loader } from "pixi.js";
import { EntityRenderer } from ".";

import { EntityType } from "../../../data/entity/entity";
import { ITower } from "../../../data/entity/towers";
import { SCALE } from "../renderer";

const TOWER_TO_ATLAS_MAP = new Map<EntityType, string>([
  [EntityType.Tower, "turret"],
  [EntityType.Flamethrower, "flamethrower"],
  [EntityType.Laser, "laser"],
  [EntityType.Mortar, "mortar"],
  [EntityType.Railgun, "railgun"],
]);

const ANIMATION_SPEED = 0.1;

class Tower extends AnimatedSprite implements EntityRenderer {
  constructor(private data: ITower, loader: Loader) {
    const atlasName = TOWER_TO_ATLAS_MAP.get(data.getType())!;
    super(Object.values(loader.resources[atlasName].spritesheet!.textures));
    this.pivot = { x: 32, y: 32 };
    this.animationSpeed = ANIMATION_SPEED;
    this.loop = false;

    this.onComplete = () => {
      this.gotoAndStop(0);
    };
  }

  sync() {
    this.position.set(
      this.data.entity.getX() * SCALE + this.pivot.x,
      this.data.entity.getY() * SCALE + this.pivot.y
    );
    this.angle = this.data.entity.getRotation();

    if (this.data.renderData.fired) {
      this.data.renderData.fired = false;
      this.play();
    }
  }
}

export { Tower };
