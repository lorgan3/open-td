import { AnimatedSprite, Loader } from "pixi.js";
import RunnerData from "../../../data/entity/enemies/runner";
import { SCALE } from "../renderer";

const ATLAS_NAME = "runner";
const ANIMATION_SPEED = 0.1;

class Runner extends AnimatedSprite {
  constructor(private data: RunnerData, loader: Loader) {
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

export { Runner };
