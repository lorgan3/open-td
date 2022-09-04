import { RenderFn } from ".";
import Rail, { LIFETIME } from "../../../data/entity/projectiles/rail";

const render: RenderFn<Rail> = (renderer, rail, htmlElement) => {
  const entity = rail.entity;
  const x = entity.getX() + 0.5;
  const y = entity.getY() + 0.5;

  const scale = Math.sqrt(
    (x - rail.targetX - 0.5) ** 2 + (y - rail.targetY - 0.5) ** 2
  );

  htmlElement.style.transformOrigin = "0 0";
  htmlElement.style.opacity = `${1 - 0.9 * (rail.time / LIFETIME)}`;
  htmlElement.style.transform = `translate(${x * renderer.xStep}px, ${
    y * renderer.yStep
  }px) rotate(${entity.getRotation()}deg) scale(${scale}, 0.1)`;
};

export default render;
