import { Container, Loader } from "pixi.js";

export interface EntityRenderer extends Container {
  sync: (dt: number, full: boolean) => void;
}

export interface EntityRendererStatics {
  readonly layer: Container;
}

export type Constructor = (new (data: any, loader: Loader) => EntityRenderer) &
  EntityRendererStatics;
