import { RenderFn } from ".";
import Enemy from "../../../data/entity/enemies/enemy";

const ONE_FOURTH = 1 / 4;

const render: RenderFn<Enemy> = (renderer, enemy, htmlElement) => {
  const entity = enemy.entity;

  const xOffset = (entity.getId() % 13) / 26 - ONE_FOURTH;
  const yOffset = ((entity.getId() + 5) % 17) / 34 - ONE_FOURTH;

  htmlElement.style.transform = `translate(${
    (entity.getX() + xOffset) * renderer.xStep
  }px, ${
    (entity.getY() + yOffset) * renderer.yStep
  }px) rotate(${entity.getRotation()}deg)`;
};

export default render;
