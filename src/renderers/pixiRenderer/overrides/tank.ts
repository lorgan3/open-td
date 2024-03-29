import { AnimatedSprite, Graphics, Sprite } from "pixi.js";
import { Status } from "../../../data/entity/enemies";
import TankData from "../../../data/entity/enemies/tank";
import { Explosion } from "../explosion";
import { BASE } from "../layer";
import { SCALE } from "../constants";
import { EntityRenderer } from "./types";
import { ControllableSound } from "../sound/controllableSound";
import { Sound } from "../sound";
import Renderer from "../renderer";
import { COOLDOWN } from "../../../data/entity/enemies/enemyAI";
import { createShadow, deleteShadow, ShadowSize } from "./shadow";
import { AssetsContainer } from "../assets/container";
import { ATLAS, AtlasTile } from "../atlas";

const ANIMATION_SPEED = 0.1;
const ONE_FOURTH = 1 / 4;

class Tank extends AnimatedSprite implements EntityRenderer {
  public static readonly layer = BASE;
  public static readonly atlas = "tank";

  shadow: Graphics;
  private flames: Sprite[] = [];
  private oldOffset = 0;

  constructor(private data: TankData, private container: AssetsContainer) {
    super(Object.values(container.assets![Tank.atlas].textures) as any);
    this.anchor.set(0.5);
    this.animationSpeed = ANIMATION_SPEED;
    this.shadow = createShadow(ShadowSize.medium);

    this.on("removed", () => {
      deleteShadow(this.shadow);

      if (data.AI.hp <= 0) {
        new Explosion(
          container,
          data.entity.getX() + 0.5,
          data.entity.getY() + 0.5
        );
      }
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
    if (this.data.AI.isAttacking()) {
      const offset =
        Math.sin(((Renderer.Instance.getTime() % COOLDOWN) / COOLDOWN) * 5) *
        20;
      this.angle += offset;

      if (Math.sign(offset) === 1 && Math.sign(this.oldOffset) === -1) {
        ControllableSound.fromEntity(this.data.entity, Sound.Hit);
      }
      this.oldOffset = offset;
    }

    if (this.data.AI.isBusy() === this.playing) {
      if (this.playing) {
        this.stop();
      } else {
        this.play();
        this.oldOffset = 0;
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
          this.container.assets![ATLAS].textures[AtlasTile.Fire]
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

export { Tank };
