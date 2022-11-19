import { Loader } from "pixi.js";
import { Agent } from "../../../data/entity/entity";
import { Explosion } from "../explosion";
import { TOWERS } from "../layer";
import { GenericProjectile } from "./genericProjectile";

class Rocket extends GenericProjectile {
  public static readonly layer = TOWERS;

  constructor(data: Agent, loader: Loader) {
    super(data, loader);

    this.on(
      "removed",
      () => new Explosion(loader, data.entity.getX(), data.entity.getY(), 2)
    );
  }
}

export { Rocket };
