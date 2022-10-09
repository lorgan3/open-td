import Controller from "../data/controller";
import Surface from "../data/terrain/surface";

export interface IRenderer {
  mount(target: HTMLDivElement): void;
  unmount(): void;
  rerender(dt: number): void;
  showCoverage(): void;
  hideCoverage(): void;
  showMessage: MessageFn;
  move(params: { x?: number; y?: number; zoom?: number }): void;
}

export type Constructor = new (
  surface: Surface,
  controller: Controller
) => IRenderer;

export type MessageFn = (
  content: string,
  config?: {
    override?: number;
    closable?: boolean;
    expires?: number;
  }
) => Promise<number>;

export const DEFAULT_EXPIRE_TIME = 2000;

declare global {
  interface Window {
    debug: () => void;
  }
}
