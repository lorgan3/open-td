import fragment from "./world.frag?raw";
import vertex from "./world.vert?raw";

import { BaseTexture, MeshMaterial, Program, Texture } from "pixi.js";
import Surface from "../../../data/terrain/surface";
import { getAssets } from "../assets";
import { TileType } from "../../../data/terrain/constants";
import { SCALE } from "../constants";

// Inspired by https://godotshaders.com/shader/rimworld-style-tilemap-shader-with-tutorial-video/
// This does not use any code from that nor does it do the same thing though.
// This shader renders the same texture every tile and only blends adjacent tiles.

class WorldShader extends MeshMaterial {
  private canvas: OffscreenCanvas;
  private context: OffscreenCanvasRenderingContext2D;
  private imageData: ImageData;

  constructor(private surface: Surface, textured = true, blended = true) {
    super(Texture.EMPTY, {
      program: new Program(vertex, fragment),
      uniforms: { tileSize: SCALE, time: 0, textured, blended },
    });

    this.canvas = new OffscreenCanvas(
      this.surface.getWidth(),
      this.surface.getHeight()
    );
    this.context = this.canvas.getContext("2d")!;
    this.imageData = this.context.createImageData(
      this.surface.getWidth(),
      this.surface.getHeight()
    );

    this.uniforms.world = new Texture(new BaseTexture(this.canvas));

    getAssets().then((assets) => {
      this.uniforms.atlas = assets.terrain.baseTexture;
      this.uniforms.mask = assets.mask.baseTexture;
    });
  }

  render(debug = false) {
    this.surface.getTiles().forEach((tile, i) => {
      const tiles =
        tile.isDiscovered() || debug
          ? tile.getAnimation()
          : [TileType.Obstructed];

      this.imageData.data[i * 4] = tiles[0];
      this.imageData.data[i * 4 + 1] = tiles[1] || tiles[0];
      this.imageData.data[i * 4 + 2] = tiles[2] || tiles[0];

      this.imageData.data[i * 4 + 3] = 255;
    });

    this.context.putImageData(this.imageData, 0, 0);
    this.uniforms.world.update();
  }

  setBlended(blended: boolean) {
    this.uniforms.blended = blended;
  }

  setTextured(textured: boolean) {
    this.uniforms.textured = textured;
  }

  setTime(time: number) {
    this.uniforms.time = Math.sin(time / 1000) * 3;
  }
}

export { WorldShader };
