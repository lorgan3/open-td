import { Agent } from "../../../data/entity/entity";
import Renderer from "../renderer";
import renderRail from "./rail";
import renderFlame from "./flame";
import renderEnemy from "./genericEnemy";
import renderFlier from "./flier";
import renderBlueprint from "./blueprint";
import renderLaserBeam from "./laserBeam";
import renderProjectile from "./genericProjectile";
import { EntityType } from "../../../data/entity/constants";

export type RenderFn<T extends Agent> = (
  renderer: Renderer,
  agent: T,
  htmlElement: HTMLSpanElement
) => void;

export const OVERRIDES: Partial<Record<EntityType, RenderFn<any>>> = {
  [EntityType.Rail]: renderRail,
  [EntityType.Flame]: renderFlame,
  [EntityType.Slime]: renderEnemy,
  [EntityType.Runner]: renderEnemy,
  [EntityType.Flier]: renderFlier,
  [EntityType.Tank]: renderEnemy,
  [EntityType.Blueprint]: renderBlueprint,
  [EntityType.LaserBeam]: renderLaserBeam,
  [EntityType.Bullet]: renderProjectile,
  [EntityType.Rocket]: renderProjectile,
  [EntityType.Shockwave]: renderProjectile,
  [EntityType.Behemoth]: renderEnemy,
  [EntityType.Bore]: renderEnemy,
};
