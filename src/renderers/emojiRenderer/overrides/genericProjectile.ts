import { RenderFn } from ".";
import { Agent } from "../../../data/entity/entity";

const render: RenderFn<Agent> = (renderer, enemy, htmlElement) => {
  const entity = enemy.entity;

  htmlElement.style.transform = `translate(${
    (entity.getX() - 0.5) * renderer.xStep
  }px, ${
    (entity.getY() - 0.5) * renderer.yStep
  }px) rotate(${entity.getRotation()}deg)`;
};

export default render;
