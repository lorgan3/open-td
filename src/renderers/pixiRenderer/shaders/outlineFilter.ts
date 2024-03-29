import fragment from "./outline.frag?raw";
import { Filter } from "@pixi/core";
import type { FilterSystem, RenderTexture } from "@pixi/core";
import type { CLEAR_MODES } from "@pixi/constants";
import { Color } from "pixi.js";

// https://github.com/pixijs/filters/tree/9da22187ec13b8224ff6cc00dfaed029695a9d87/filters/outline
// https://stackoverflow.com/questions/72056609/pixi-js-how-to-draw-outline-of-container-while-keeping-its-content-transparent
class OutlineFilter extends Filter {
  /** The minimum number of samples for rendering outline. */
  public static MIN_SAMPLES = 1;

  /** The maximum number of samples for rendering outline. */
  public static MAX_SAMPLES = 100;

  private _thickness = 1;

  /**
   * @param {number} [thickness=1] - The tickness of the outline. Make it 2 times more for resolution 2
   * @param {number} [color=0x000000] - The color of the outline.
   * @param {number} [quality=0.1] - The quality of the outline from `0` to `1`, using a higher quality
   *        setting will result in slower performance and more accuracy.
   */
  constructor(thickness = 1, color = 0x000000, quality = 0.1) {
    super(
      undefined,
      fragment.replace(/\$\{angleStep\}/, OutlineFilter.getAngleStep(quality))
    );

    this.uniforms.thickness = new Float32Array([0, 0]);
    this.uniforms.outlineColor = new Float32Array([0, 0, 0, 1]);

    Object.assign(this, { thickness, color, quality });
  }

  /**
   * Get the angleStep by quality
   */
  private static getAngleStep(quality: number): string {
    if (quality === 0) {
      return (Math.PI / 2).toFixed(7);
    }

    const samples = Math.max(
      quality * OutlineFilter.MAX_SAMPLES,
      OutlineFilter.MIN_SAMPLES
    );

    return ((Math.PI * 2) / samples).toFixed(7);
  }

  apply(
    filterManager: FilterSystem,
    input: RenderTexture,
    output: RenderTexture,
    clear: CLEAR_MODES
  ): void {
    this.uniforms.thickness[0] = this._thickness / input._frame.width;
    this.uniforms.thickness[1] = this._thickness / input._frame.height;

    filterManager.applyFilter(this, input, output, clear);
  }

  /**
   * The color of the glow.
   */
  get color(): number {
    return new Color(this.uniforms.outlineColor).toNumber();
  }
  set color(value: number) {
    this.uniforms.outlineColor = new Color(value).toRgbArray();
  }

  /**
   * The thickness of the outline.
   */
  get thickness(): number {
    return this._thickness;
  }
  set thickness(value: number) {
    this._thickness = value;
    this.padding = value;
  }
}

export { OutlineFilter };
