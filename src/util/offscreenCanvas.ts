// https://gist.github.com/n1ru4l/9c7eff52fe084d67ff15ae6b0af5f171

if (!window.OffscreenCanvas) {
  window.OffscreenCanvas = class OffscreenCanvas {
    private canvas: HTMLCanvasElement;

    constructor(width: number, height: number) {
      this.canvas = document.createElement("canvas");
      this.canvas.width = width;
      this.canvas.height = height;

      (this.canvas as any).convertToBlob = () => {
        return new Promise((resolve) => {
          this.canvas.toBlob(resolve);
        });
      };

      return this.canvas as unknown as OffscreenCanvas;
    }
  } as any;
}
