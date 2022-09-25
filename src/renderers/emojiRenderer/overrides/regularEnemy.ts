import { RenderFn } from ".";
import { Status } from "../../../data/entity/enemies";
import { COOLDOWN } from "../../../data/entity/enemies/enemyAI";
import Enemy from "../../../data/entity/enemies/regular";

const ONE_FOURTH = 1 / 4;

const render: RenderFn<Enemy> = (renderer, enemy, htmlElement) => {
  const entity = enemy.entity;

  const xOffset = (entity.getId() % 13) / 26 - ONE_FOURTH;
  const yOffset = ((entity.getId() + 5) % 17) / 34 - ONE_FOURTH;
  const time = (renderer.getTime() % 13) / 3;

  let rotation = entity.getRotation();
  if (enemy.AI.isBusy()) {
    rotation += Math.sin(((renderer.getTime() % COOLDOWN) / COOLDOWN) * 5) * 20;
  }

  if (enemy.getStatus() === Status.OnFire) {
    htmlElement.style.color = "transparent";
    htmlElement.style.textShadow = `${Math.random() - 0.5}px ${
      Math.random() - 0.5
    }px ${time + 2}px #E25822`;
  } else if (enemy.getStatus() === Status.Normal) {
    htmlElement.style.color = "initial";
    htmlElement.style.textShadow = "none";
  }

  htmlElement.style.transform = `translate(${
    (entity.getX() + xOffset) * renderer.xStep
  }px, ${(entity.getY() + yOffset) * renderer.yStep}px) rotate(${rotation}deg)`;
};

export default render;
