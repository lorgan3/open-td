import { Loader } from "pixi.js";
import { Agent } from "../../../data/entity/entity";
import { Explosion } from "../explosion";
import { TOWERS } from "../layer";
import { Sound } from "../sound";
import { ControllableSound } from "../sound/controllableSound";
import { GenericProjectile } from "./genericProjectile";

class Rocket extends GenericProjectile {
  public static readonly layer = TOWERS;

  constructor(data: Agent, loader: Loader) {
    super(data, loader);

    this.on("removed", () => {
      new Explosion(loader, data.entity.getX(), data.entity.getY(), 2);
      ControllableSound.fromEntity(data.entity, Sound.Explosion);
    });
  }
}

export { Rocket };
