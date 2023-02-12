import { Container, Graphics } from "pixi.js";
import { AssetsContainer } from "../assets/container";

export interface EntityRenderer extends Container {
  sync: (dt: number, full: boolean) => void;
  shadow?: Graphics;
}

export interface EntityRendererStatics {
  readonly layer: Container;
}

export type Constructor = (new (
  data: any,
  container: AssetsContainer
) => EntityRenderer) &
  EntityRendererStatics;
