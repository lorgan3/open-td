import { TOWERS } from "../layer";
import { SimpleProjectile } from "./genericProjectile";

class Rocket extends SimpleProjectile {
  public static readonly layer = TOWERS;
}

export { Rocket };
