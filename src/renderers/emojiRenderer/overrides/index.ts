import { Agent, EntityType } from "../../../data/entity/entity";
import Renderer from "../renderer";
import renderRail from "./rail";

export type RenderFn<T extends Agent> = (
  renderer: Renderer,
  agent: T,
  htmlElement: HTMLSpanElement
) => void;

export const OVERRIDES: Partial<Record<EntityType, RenderFn<any>>> = {
  [EntityType.Rail]: renderRail,
};
