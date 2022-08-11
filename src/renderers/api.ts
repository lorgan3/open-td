export interface IRenderer {
  mount(target: HTMLDivElement): void;
  unmount(): void;
  rerender(): void;
}
