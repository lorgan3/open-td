import { Graphics } from "pixi.js";

import { FLOOR } from "../layer";

export enum ShadowSize {
  small = 8,
  medium = 16,
}

export const createShadow = (size: ShadowSize) => {
  const shadow = new Graphics();

  shadow.fill.color = 0x000000;
  shadow.fill.alpha = 0.4;
  shadow.fill.visible = true;
  shadow.drawCircle(0, 0, size);

  FLOOR.addChild(shadow);
  return shadow;
};

export const deleteShadow = (shadow: Graphics) => {
  FLOOR.removeChild(shadow);
};
