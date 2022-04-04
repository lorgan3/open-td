import Surface from "../data/terrain/surface";

export interface IRenderer {
  render(target: HTMLDivElement, surface: Surface): void;
}
