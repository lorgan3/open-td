import { RenderFn } from ".";
import Flame, { LIFETIME } from "../../../data/entity/projectiles/flame";

const render: RenderFn<Flame> = (renderer, flame, htmlElement) => {
  const entity = flame.entity;

  htmlElement.style.opacity = `${1 - 0.9 * (flame.time / LIFETIME)}`;
  htmlElement.style.transform = `translate(${
    (entity.getX() + Math.random() * 0.3 - 0.15) * renderer.xStep
  }px, ${
    (entity.getY() + Math.random() * 0.3 - 0.15) * renderer.yStep
  }px) rotate(${-entity.getRotation() + 180 + Math.random() * 10 - 5}deg)`;
};

export default render;
