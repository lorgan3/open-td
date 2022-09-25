import { Agent, EntityType } from "../../../data/entity/entity";
import Renderer from "../renderer";
import renderRail from "./rail";
import renderFlame from "./flame";
import renderRegularEnemy from "./regularEnemy";
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
  [EntityType.Slime]: renderRegularEnemy,
  [EntityType.Blueprint]: renderBlueprint,
  [EntityType.LaserBeam]: renderLaserBeam,
};
