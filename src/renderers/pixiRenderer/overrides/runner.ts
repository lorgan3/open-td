import { AnimatedSprite, Graphics, Loader, Sprite } from "pixi.js";
import { Status } from "../../../data/entity/enemies";
import RunnerData from "../../../data/entity/enemies/runner";
import { Explosion } from "../explosion";
import { BASE } from "../layer";
import { SCALE } from "../constants";
import { FIRE_ATLAS_NAME, FIRE_SPRITE } from "./flame";
import { EntityRenderer } from "./types";
import { ControllableSound } from "../sound/controllableSound";
import { Sound } from "../sound";
import { COOLDOWN } from "../../../data/entity/enemies/enemyAI";
import Renderer from "../renderer";
import { createShadow, deleteShadow, ShadowSize } from "./shadow";

const ANIMATION_SPEED = 0.1;
const ONE_FOURTH = 1 / 4;

class Runner extends AnimatedSprite implements EntityRenderer {
  public static readonly layer = BASE;
  public static readonly atlas = "runner";

  private flames: Sprite[] = [];
  private shadow: Graphics;

  constructor(private data: RunnerData, private loader: Loader) {
    super(Object.values(loader.resources[Runner.atlas].spritesheet!.textures));
    this.anchor.set(0.5);
    this.animationSpeed = ANIMATION_SPEED;
    this.shadow = createShadow(ShadowSize.medium);

    this.on("removed", () => {
      deleteShadow(this.shadow);
      new Explosion(loader, data.entity.getX() + 0.5, data.entity.getY() + 0.5);
    });

    this.play();
  }

  sync() {
    const xOffset = 0.5 + (this.data.entity.getId() % 13) / 26 - ONE_FOURTH;
    const yOffset =
      0.5 + ((this.data.entity.getId() + 5) % 17) / 34 - ONE_FOURTH;

    this.position.set(
      (this.data.entity.getX() + xOffset) * SCALE,
      (this.data.entity.getY() + yOffset) * SCALE
    );
    this.shadow.position.copyFrom(this.position);

    this.angle = this.data.entity.getRotation();
    if (this.data.AI.isBusy()) {
      this.angle +=
        Math.sin(((Renderer.Instance.getTime() % COOLDOWN) / COOLDOWN) * 5) *
        20;
    }

    if (this.data.AI.isBusy() === this.playing) {
      if (this.playing) {
        this.stop();
      } else {
        ControllableSound.fromEntity(this.data.entity, Sound.Hit);
        this.play();
      }
    }

    const offset = SCALE / 2;
    this.flames.forEach((flame) => {
      flame.angle = -this.data.entity.getRotation();
      flame.position.set(
        Math.random() * offset - offset / 2,
        Math.random() * offset - offset / 2
      );
    });

    if (this.data.getStatus() === Status.OnFire && !this.flames.length) {
      this.tint = 0xe25822;

      for (let i = 0; i < 2; i++) {
        const flame = new Sprite(
          this.loader.resources[FIRE_ATLAS_NAME].spritesheet!.textures[
            FIRE_SPRITE
          ]
        );
        flame.alpha = 0.8;
        flame.anchor.set(0.5);
        flame.position.set(
          Math.random() * offset - offset / 2,
          Math.random() * offset - offset / 2
        );
        this.addChild(flame);
        this.flames.push(flame);
      }
    } else if (this.data.getStatus() !== Status.OnFire && this.flames.length) {
      this.tint = 0xffffff;
      this.removeChildren();
      this.flames = [];
    }
  }
}

export { Runner };
