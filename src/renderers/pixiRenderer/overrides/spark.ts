import { Container, TilingSprite } from "pixi.js";
import SparkData, { LIFETIME } from "../../../data/entity/projectiles/spark";
import { PROJECTILES } from "../layer";
import { SCALE } from "../constants";
import { EntityRenderer } from "./types";
import { AssetsContainer } from "../assets/container";

const ATLAS_NAME = "lightning";
const SPRITE = "lightning0.png";
const SPRITE_WIDTH = 32;
const SPRITE_HEIGHT = 96;

class Spark extends Container implements EntityRenderer {
  public static readonly layer = PROJECTILES;

  private sprites: TilingSprite[] = [];

  constructor(private data: SparkData, container: AssetsContainer) {
    super();

    let x = data.entity.getX();
    let y = data.entity.getY();
    for (let target of this.data.getChain()) {
      const _x = target.entity.getX() + 0.5;
      const _y = target.entity.getY() + 0.5;

      const sprite = new TilingSprite(
        container.assets![ATLAS_NAME].textures[SPRITE],
        SPRITE_WIDTH,
        SPRITE_HEIGHT
      );
      sprite.pivot = { x: SPRITE_WIDTH / 2, y: 0 };

      const scale = Math.sqrt((x - _x) ** 2 + (y - _y) ** 2);
      sprite.height = scale * SCALE;

      sprite.position.set(x * SCALE, y * SCALE);
      sprite.rotation = Math.atan2(y - _y, x - _x) + Math.PI / 2;

      x = _x;
      y = _y;
      this.addChild(sprite);
      this.sprites.push(sprite);
    }
  }

  sync() {
    this.alpha = Math.min(1, 1 - this.data.time / LIFETIME + 0.1);

    this.sprites.forEach(
      (sprite) =>
        (sprite.tilePosition.y =
          Math.floor((this.data.time / LIFETIME) * 5) * 32)
    );
  }
}

export { Spark };
