import { AnimatedSprite } from "pixi.js";
import { TOWERS } from "./layer";
import { SCALE } from "./constants";
import { AssetsContainer } from "./assets/container";

const ATLAS_NAME = "explosion";
const ANIMATION_SPEED = 0.2;

class Explosion extends AnimatedSprite {
  constructor(container: AssetsContainer, x: number, y: number, scale = 1) {
    super(Object.values(container.assets![ATLAS_NAME].textures) as any);
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
