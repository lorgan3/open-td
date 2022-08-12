import { RenderFn } from ".";
import Rail, { LIFETIME } from "../../../data/entity/projectiles/rail";

const render: RenderFn<Rail> = (renderer, rail, htmlElement) => {
  const entity = rail.entity;
  const scale = Math.sqrt(
    (entity.getX() - rail.targetX) ** 2 + (entity.getY() - rail.targetY) ** 2
  );

  htmlElement.style.transformOrigin = "0 0";
  htmlElement.style.opacity = `${1 - 0.9 * (rail.time / LIFETIME)}`;
  htmlElement.style.transform = `translate(${
    (entity.getX() + 0.5) * renderer.xStep
  }px, ${
    (entity.getY() + 0.5) * renderer.yStep
  }px) rotate(${entity.getRotation()}deg) scale(${scale}, 1)`;
};

export default render;
