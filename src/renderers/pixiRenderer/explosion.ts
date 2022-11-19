import { AnimatedSprite, Loader } from "pixi.js";
import { TOWERS } from "./layer";
import { SCALE } from "./renderer";

const ATLAS_NAME = "explosion";
const ANIMATION_SPEED = 0.2;

class Explosion extends AnimatedSprite {
  constructor(loader: Loader, x: number, y: number, scale = 1) {
    super(Object.values(loader.resources[ATLAS_NAME].spritesheet!.textures));
    this.anchor.set(0.5);
    this.animationSpeed = ANIMATION_SPEED;
    this.loop = false;
    this.position.set(x * SCALE, y * SCALE);
    this.scale.set(scale);

    TOWERS.addChild(this);
    this.onComplete = () => {
      TOWERS.removeChild(this);
    };

    this.play();
  }
}

export { Explosion };
