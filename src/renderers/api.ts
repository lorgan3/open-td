import Surface from "../data/terrain/surface";

export interface IRenderer {
  mount(target: HTMLDivElement): void;
  unmount(): void;
  rerender(dt: number): void;
}
