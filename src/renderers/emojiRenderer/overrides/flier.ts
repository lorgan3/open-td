import { RenderFn } from ".";
import { Status } from "../../../data/entity/enemies";
import { COOLDOWN } from "../../../data/entity/enemies/enemyAI";
import { IEnemy } from "../../../data/entity/enemies";

const ONE_FOURTH = 1 / 4;
const ONE_EIGHTH = 1 / 8;
const FLY_SPEED = 0.0015;

const render: RenderFn<IEnemy> = (renderer, enemy, htmlElement) => {
  const entity = enemy.entity;

  const flySpeed = FLY_SPEED * (1 + (entity.getId() % 13) / 13);

  const xOffset =
    Math.sin((renderer.getTime() + entity.getId()) * flySpeed) / 4 - ONE_EIGHTH;
  const yOffset =
    Math.cos((renderer.getTime() + entity.getId()) * flySpeed) / 2 - ONE_FOURTH;
  const time = (renderer.getTime() % 13) / 3;

  const _rotation = (entity.getRotation() + 360) % 360;
  const xScale = _rotation > 0 && _rotation < 180 ? -1 : 1;

  let rotation = 0;
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
  }px, ${
    (entity.getY() + yOffset) * renderer.yStep
  }px) rotate(${rotation}deg) scale(${xScale},1)`;
};

export default render;
