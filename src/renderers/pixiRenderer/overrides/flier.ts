import { AnimatedSprite, Loader } from "pixi.js";
import { EntityRenderer } from ".";
import FlierData from "../../../data/entity/enemies/flier";
import { SCALE } from "../renderer";

const ATLAS_NAME = "flier";
const ANIMATION_SPEED = 0.2;

class Flier extends AnimatedSprite implements EntityRenderer {
  constructor(private data: FlierData, loader: Loader) {
    super(Object.values(loader.resources[ATLAS_NAME].spritesheet!.textures));
    this.pivot = { x: 16, y: 16 };
    this.animationSpeed = ANIMATION_SPEED;

    this.play();
  }

  sync() {
    this.position.set(
      this.data.entity.getX() * SCALE,
      this.data.entity.getY() * SCALE
    );
    this.angle = this.data.entity.getRotation();
  }
}

export { Flier };
