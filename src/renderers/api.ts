export interface IRenderer {
  mount(target: HTMLDivElement): void;
  unmount(): void;
  rerender(dt: number): void;
  showCoverage(): void;
  hideCoverage(): void;
  showMessage: MessageFn;
}

export type MessageFn = (
  content: string,
  config?: {
    override?: boolean;
    closable?: boolean;
    input?: { type: "keyboard" };
  }
) => any | Promise<any>;
