import { Agent, EntityType } from "../../../data/entity/entity";
import Renderer from "../renderer";
import renderRail from "./rail";
import renderFlame from "./flame";
import renderEnemy from "./genericEnemy";
import renderFlier from "./flier";
import renderBlueprint from "./blueprint";
import renderLaserBeam from "./laserBeam";

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
  [EntityType.Blueprint]: renderBlueprint,
  [EntityType.LaserBeam]: renderLaserBeam,
};
