import { RenderFn } from ".";
import Blueprint from "../../../data/entity/Blueprint";
import { StaticAgentStatics } from "../../../data/entity/staticEntity";

const render: RenderFn<Blueprint> = (renderer, blueprint, htmlElement) => {
  const entity = blueprint.entity;

  htmlElement.children[0].textContent = renderer.getStaticEntityEmoji(
    blueprint.getPlaceable().entityType
  );
  htmlElement.style.transformOrigin = "0 0";
  htmlElement.style.opacity = "0.5";
  htmlElement.style.filter = "grayscale(0.6)";
  htmlElement.style.transform = `translate(${
    entity.getX() * renderer.xStep
  }px, ${
    entity.getY() * renderer.yStep
  }px) rotate(${entity.getRotation()}deg) scale(${blueprint.getScale()})`;
};

export default render;
