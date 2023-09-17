import fragment from "./fallbackWorld.frag?raw";
import vertex from "./fallbackWorld.vert?raw";

import { BaseTexture, MeshMaterial, Program, Texture } from "pixi.js";
import Surface from "../../../data/terrain/surface";
import {
  AltTileType,
  DiscoveryStatus,
  TileType,
} from "../../../data/terrain/constants";
import { SCALE } from "../constants";
import Tile from "../../../data/terrain/tile";
import { IWorldShader } from "./worldShader";
import { getAssets } from "../assets";

class FallbackWorldShader extends MeshMaterial implements IWorldShader {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private imageData: ImageData;

  constructor(private surface: Surface) {
    super(Texture.EMPTY, {
      program: new Program(vertex, fragment),
      uniforms: {
        tileSize: SCALE,
        bridgeId: TileType.Bridge,
        time: 0,
        // Can't get texture sizes in webgl 1.0... I think
        worldSize: [surface.getWidth(), surface.getHeight()],
        atlasSize: [160, 192],
        maskSize: [192, 192],
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

    // Initialize with a texture right away to prevent weird corruption if assets weren't loaded yet.
    this.uniforms.atlas = Texture.from(this.canvas);
    this.uniforms.mask = Texture.from(this.canvas);

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

export { FallbackWorldShader };
