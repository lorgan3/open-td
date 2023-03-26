import { AnimatedSprite, Graphics, Sprite } from "pixi.js";
import { Status } from "../../../data/entity/enemies";
import FlierData from "../../../data/entity/enemies/flier";
import { Explosion } from "../explosion";
import { TOWERS } from "../layer";
import { SCALE } from "../constants";
import { EntityRenderer } from "./types";
import Renderer from "../renderer";
import { COOLDOWN } from "../../../data/entity/enemies/enemyAI";
import { ControllableSound } from "../sound/controllableSound";
import { Sound } from "../sound";
import { createShadow, deleteShadow, ShadowSize } from "./shadow";
import { AssetsContainer } from "../assets/container";
import { ATLAS, AtlasTile } from "../atlas";

const ANIMATION_SPEED = 0.2;
const ONE_FOURTH = 1 / 4;
const ONE_EIGHTH = 1 / 8;
const FLY_SPEED = 0.0015;

class Flier extends AnimatedSprite implements EntityRenderer {
  public static readonly layer = TOWERS; // Fliers fly over towers
  public static readonly atlas = "flier";

  shadow: Graphics;
  private flames: Sprite[] = [];
  private oldOffset = 0;

  constructor(private data: FlierData, private container: AssetsContainer) {
    super(Object.values(container.assets![Flier.atlas].textures) as any);
    this.anchor.set(0.5);
    this.animationSpeed = ANIMATION_SPEED;
    this.shadow = createShadow(ShadowSize.small);

    this.play();

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
  }

  sync() {
    const flySpeed = FLY_SPEED * (1 + (this.data.entity.getId() % 13) / 13);

    const xOffset =
      0.5 +
      Math.sin(
        (Renderer.Instance.getTime() + this.data.entity.getId()) * flySpeed
      ) /
        4 -
      ONE_EIGHTH;
    const yOffset =
      0.5 +
      Math.cos(
        (Renderer.Instance.getTime() + this.data.entity.getId()) * flySpeed
      ) /
        2 -
      ONE_FOURTH;

    this.position.set(
      (this.data.entity.getX() + xOffset) * SCALE,
      (this.data.entity.getY() + yOffset) * SCALE
    );

    this.shadow.position.set(
      (this.data.entity.getX() + 0.5) * SCALE,
      (this.data.entity.getY() + 0.5) * SCALE
    );

    this.angle = this.data.entity.getRotation();
    if (this.data.AI.isBusy()) {
      const oldAngle = this.angle;
      this.angle +=
        Math.sin(((Renderer.Instance.getTime() % COOLDOWN) / COOLDOWN) * 5) *
        20;

      if (Math.sign(this.angle) !== Math.sign(oldAngle)) {
        ControllableSound.fromEntity(this.data.entity, Sound.Hit);
      }
    }

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
    } else {
      this.oldOffset = 0;
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

export { Flier };
