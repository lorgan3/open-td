import fragment from "./world.frag?raw";
import vertex from "./world.vert?raw";

import { MeshMaterial, Program, Texture } from "pixi.js";
import Surface from "../../../data/terrain/surface";
import { getAssets } from "../assets";
import {
  AltTileType,
  DiscoveryStatus,
  TileType,
} from "../../../data/terrain/constants";
import { SCALE } from "../constants";
import Tile from "../../../data/terrain/tile";

export interface IWorldShader extends MeshMaterial {
  render(debug: boolean): void;
  setTime(time: number): void;
}

// Inspired by https://godotshaders.com/shader/rimworld-style-tilemap-shader-with-tutorial-video/
// This does not use any code from that nor does it do the same thing though.
// This shader renders the same texture every tile and only blends adjacent tiles.

class WorldShader extends MeshMaterial implements IWorldShader {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private imageData: ImageData;

  constructor(private surface: Surface, textured = true, blended = true) {
    super(Texture.EMPTY, {
      program: new Program(vertex, fragment),
      uniforms: {
        tileSize: SCALE,
        bridgeId: TileType.Bridge,
        time: 0,
        textured,
        blended,
      },
    });

    this.canvas = document.createElement("canvas");
    this.canvas.width = this.surface.getWidth();
    this.canvas.height = this.surface.getHeight();

    this.context = this.canvas.getContext("2d")!;
    this.imageData = this.context.createImageData(
      this.surface.getWidth(),
      this.surface.getHeight()
    );

    this.uniforms.world = Texture.from(this.canvas);

    getAssets().then((assets) => {
      this.uniforms.atlas = assets.terrain.baseTexture;
      this.uniforms.mask = assets.mask.baseTexture;
    });
  }

  render(debug = false) {
    this.surface.getTiles().forEach((tile, i) => {
      let types = debug ? tile.getAnimation() : this.getTileTypes(tile);

      this.imageData.data[i * 4] = types[0];
      this.imageData.data[i * 4 + 1] = types[1] || types[0];
      this.imageData.data[i * 4 + 2] = types[2] || types[0];

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
    this.uniforms.time = time / 600;
  }

  private getTileTypes = (tile: Tile) => {
    switch (tile.getDiscoveryStatus()) {
      case DiscoveryStatus.Discovered:
        return tile.getAnimation();

      case DiscoveryStatus.Pending:
        return [AltTileType.Static1, AltTileType.Static2, AltTileType.Static3];

      default:
        return [TileType.Obstructed];
    }
  };
}

export { WorldShader };
