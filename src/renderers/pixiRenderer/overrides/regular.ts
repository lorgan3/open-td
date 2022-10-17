import { AnimatedSprite, Loader } from "pixi.js";
import RegularData from "../../../data/entity/enemies/regular";
import { SCALE } from "../renderer";

const ATLAS_NAME = "regular";
const ANIMATION_SPEED = 0.1;

class Regular extends AnimatedSprite {
  constructor(private data: RegularData, loader: Loader) {
    super(Object.values(loader.resources[ATLAS_NAME].spritesheet!.textures));
    this.pivot = { x: 16, y: 16 };
    this.animationSpeed = ANIMATION_SPEED;
  }

  sync() {
    this.position.set(
      this.data.entity.getX() * SCALE,
      this.data.entity.getY() * SCALE
    );
    this.angle = this.data.entity.getRotation();

    if (this.data.AI.isBusy() === this.playing) {
      this.playing ? this.stop() : this.play();
    }
  }
}

export { Regular };
