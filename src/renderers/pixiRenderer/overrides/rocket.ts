import { Graphics, Loader } from "pixi.js";
import { Explosion } from "../explosion";
import { TOWERS } from "../layer";
import { Sound } from "../sound";
import { ControllableSound } from "../sound/controllableSound";
import { GenericProjectile } from "./genericProjectile";
import RocketData from "../../../data/entity/projectiles/rocket";
import { createShadow, deleteShadow, ShadowSize } from "./shadow";
import { SCALE } from "../constants";

class Rocket extends GenericProjectile {
  public static readonly layer = TOWERS;

  private shadow: Graphics;

  constructor(protected data: RocketData, loader: Loader) {
    super(data, loader);

    this.shadow = createShadow(ShadowSize.small);

    this.on("removed", () => {
      deleteShadow(this.shadow);
      new Explosion(loader, data.entity.getX(), data.entity.getY(), 2);
      ControllableSound.fromEntity(data.entity, Sound.Explosion);
    });
  }

  sync() {
    super.sync();

    this.shadow.position.set(
      this.data.entity.getX() * SCALE,
      this.data.straightY * SCALE
    );

    const scale = 1 - Math.abs(this.data.getPercentage() - 0.5) * 0.8;
    this.shadow.scale.set(scale);
  }
}

export { Rocket };
