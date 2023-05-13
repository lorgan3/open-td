import { AnimatedSprite, Graphics, Sprite } from "pixi.js";
import { Status } from "../../../data/entity/enemies";
import BoreData from "../../../data/entity/enemies/bore";
import { Explosion } from "../explosion";
import { BASE } from "../layer";
import { SCALE } from "../constants";
import { EntityRenderer } from "./types";
import { createShadow, deleteShadow, ShadowSize } from "./shadow";
import { AssetsContainer } from "../assets/container";
import { ATLAS, AtlasTile } from "../atlas";
import { ControllableSound } from "../sound/controllableSound";
import { Sound } from "../sound";
import Renderer from "../renderer";
import Manager from "../../../data/controllers/manager";
import { HealthBar } from "./healthBar";

const ANIMATION_SPEED = 0.075;
const ONE_FOURTH = 1 / 4;

class Bore extends AnimatedSprite implements EntityRenderer {
  public static readonly layer = BASE;
  public static readonly atlas = "bore";

  shadow: Graphics;
  private flames: Sprite[] = [];
  private sound?: ControllableSound;
  private wasAttacking = false;
  private healthBar?: HealthBar;

  constructor(private data: BoreData, private container: AssetsContainer) {
    super(Object.values(container.assets![Bore.atlas].textures) as any);
    this.anchor.set(0.5);
    this.animationSpeed = ANIMATION_SPEED;
    this.shadow = createShadow(ShadowSize.large);
    this.scale.set(2);

    this.sound = ControllableSound.fromEntity(this.data.entity, Sound.Tank, {
      loop: true,
    });

    this.on("removed", () => {
      this.sound?.destroy();
      deleteShadow(this.shadow);

      this.healthBar?.remove();

      if (data.AI.hp <= 0) {
        new Explosion(
          container,
          data.entity.getX() + 1,
          data.entity.getY() + 1,
          2
        );
      }
    });

    this.play();
  }

  sync() {
    if (this.sound) {
      this.sound.update(this.data.entity);
    }

    if (this.data.AI.isAttacking() && !this.wasAttacking) {
      this.sound?.destroy();
      ControllableSound.fromEntity(this.data.entity, Sound.Drill);
    }
    if (
      !this.data.AI.isAttacking() &&
      this.wasAttacking &&
      !Manager.Instance.getIsBaseDestroyed()
    ) {
      this.sound = ControllableSound.fromEntity(this.data.entity, Sound.Tank, {
        loop: true,
      });
    }
    this.wasAttacking = this.data.AI.isAttacking();

    const posOffset = this.data.AI.isAttacking()
      ? Math.sin(((Renderer.Instance.getTime() % 200) / 200) * 5) * 0.05
      : 0;

    const xOffset =
      1 +
      (this.data.entity.getId() % 13) / 26 -
      ONE_FOURTH +
      Math.cos(this.rotation + Math.PI / 2) * posOffset;
    const yOffset =
      1 +
      ((this.data.entity.getId() + 5) % 17) / 34 -
      ONE_FOURTH +
      Math.sin(this.rotation + Math.PI / 2) * posOffset;

    this.position.set(
      (this.data.entity.getX() + xOffset) * SCALE,
      (this.data.entity.getY() + yOffset) * SCALE
    );
    this.shadow.position.copyFrom(this.position);

    this.angle = this.data.entity.getRotation();

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

    if (this.data.AI.getHpPercent() < 1) {
      if (!this.healthBar) {
        this.healthBar = new HealthBar(this.data);
      }

      this.healthBar.update!(this.position.x, this.position.y);
    }
  }
}

export { Bore };
