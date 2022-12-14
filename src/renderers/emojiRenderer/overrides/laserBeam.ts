import { RenderFn } from ".";
import LaserBeam, {
  LIFETIME,
} from "../../../data/entity/projectiles/laserBeam";

const render: RenderFn<LaserBeam> = (renderer, laserBeam, htmlElement) => {
  const entity = laserBeam.entity;
  const x = entity.getX();
  const y = entity.getY();

  const scale = Math.sqrt(
    (x - laserBeam.targetX) ** 2 + (y - laserBeam.targetY) ** 2
  );

  htmlElement.style.color = "transparent";
  htmlElement.style.textShadow = "0 0 0 #E25822";
  htmlElement.style.transformOrigin = "0 0";
  htmlElement.style.opacity = `${1 - 0.9 * (laserBeam.time / LIFETIME)}`;
  htmlElement.style.transform = `translate(${x * renderer.xStep}px, ${
    y * renderer.yStep
  }px) rotate(${entity.getRotation()}deg) scale(${scale}, 0.1)`;
};

export default render;
