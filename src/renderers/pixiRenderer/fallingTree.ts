import { Sprite, Texture, Ticker, UPDATE_PRIORITY } from "pixi.js";

import { SCALE } from "./constants";
import { TOWERS } from "./layer";

class FallingTree extends Sprite {
  private static lifetime = 40;
  private static fadeTime = this.lifetime * 0.8;

  private direction: number;
  private velocity = 0;
  private bounceForce = 10;
  private time = 0;

  constructor(texture: Texture, x: number, y: number) {
    super(texture);
    this.anchor.set(0.5, 1);
    this.position.set((x + 0.5) * SCALE, (y + 1) * SCALE);

    this.direction = Math.sign(Math.random() - 0.5) / 80;
    this.velocity = 0;

    Ticker.shared.add(this.tick, undefined, UPDATE_PRIORITY.LOW);
    TOWERS.addChild(this);
  }

  private tick = (dt: number) => {
    this.time += dt;

    if (this.time > FallingTree.lifetime) {
      TOWERS.removeChild(this);
      Ticker.shared.remove(this.tick);
      return;
    }

    if (this.time > FallingTree.fadeTime) {
      this.alpha =
        1 - (this.time - FallingTree.fadeTime) / FallingTree.fadeTime;
    }

    if (this.bounceForce > 2) {
      this.velocity += this.direction;
      this.rotation += this.velocity;

      if (this.rotation > Math.PI / 2 || this.rotation < -Math.PI / 2) {
        this.velocity = -this.direction * this.bounceForce;
        this.bounceForce /= 2;
      }
    }
  };
}

export { FallingTree };
