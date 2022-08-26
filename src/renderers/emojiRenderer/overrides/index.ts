import { Agent, EntityType } from "../../../data/entity/entity";
import Renderer from "../renderer";
import renderRail from "./rail";
import renderFlame from "./flame";
import renderEnemy from "./enemy";
import renderBlueprint from "./blueprint";

export type RenderFn<T extends Agent> = (
  renderer: Renderer,
  agent: T,
  htmlElement: HTMLSpanElement
) => void;

export const OVERRIDES: Partial<Record<EntityType, RenderFn<any>>> = {
  [EntityType.Rail]: renderRail,
  [EntityType.Flame]: renderFlame,
  [EntityType.Slime]: renderEnemy,
  [EntityType.Blueprint]: renderBlueprint,
};
