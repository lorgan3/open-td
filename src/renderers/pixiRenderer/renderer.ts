import { createApp } from "vue";
import Controller from "../../data/controller";
import Surface from "../../data/terrain/surface";
import { IRenderer, MessageFn } from "../api";
import SimpleMessage from "../../components/SimpleMessage.vue";

import { Application, Graphics, InteractionEvent, Loader } from "pixi.js";
import { CompositeTilemap } from "@pixi/tilemap";
import { AtlasTile, TILE_TO_ATLAS_MAP } from "./atlas";
import { Viewport } from "pixi-viewport";
import { settings } from "@pixi/tilemap";
import { TileType } from "../../data/terrain/tile";
import Manager from "../../data/manager";

let DEBUG = false;
const SCALE = 32;
const SCROLL_SPEED = 20;
const MAX_SCALE = 3;
const MIN_SCALE = 0.5;

settings.use32bitIndex = true;

class Renderer implements IRenderer {
  private messageFn: Promise<MessageFn>;
  private resolveMessageFn!: (fn: MessageFn) => void;

  private target?: HTMLElement;
  private app?: Application;
  private viewport?: Viewport;
  private tilemap?: CompositeTilemap;

  private selection?: Graphics;

  private loader: Loader;

  public x = 0;
  public y = 0;
  private scale = 1;
  private width = 0;
  private height = 0;

  private time = 0;

  constructor(private surface: Surface, private controller: Controller) {
    this.messageFn = new Promise(
      (resolve) => (this.resolveMessageFn = resolve)
    );

    this.loader = new Loader();
    this.loader.add("atlas", "./src/assets/grass.json");
    this.loader.load();

    window.debug = () => {
      DEBUG = !DEBUG;
    };
  }

  mount(target: HTMLDivElement): void {
    this.target = target;

    this.app = new Application({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    target.appendChild(this.app.view);

    this.width = this.surface.getWidth() * SCALE;
    this.height = this.surface.getHeight() * SCALE;
    this.viewport = new Viewport({
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      worldWidth: this.width,
      worldHeight: this.height,
      interaction: this.app.renderer.plugins.interaction,
    })
      .clamp({
        direction: "all",
        underflow: "center",
      })
      .drag({ wheel: true, clampWheel: true, pressDrag: false })
      .addListener("moved", ({ type }: { type: string }) => {
        if (type !== "animate") {
          this.x = this.viewport!.center.x;
          this.y = this.viewport!.center.y;
        }
      });

    this.app.stage.addChild(this.viewport);

    this.tilemap = new CompositeTilemap();
    this.viewport!.addChild(this.tilemap);
    this.selection = new Graphics();
    this.viewport!.addChild(this.selection);

    if (this.loader.loading) {
      this.loader.onComplete.add(() => this.renderTilemap());
    } else {
      this.renderTilemap();
    }

    const container = target.appendChild(document.createElement("div"));
    createApp(SimpleMessage, {
      register: this.resolveMessageFn,
    }).mount(container);

    const center = Manager.Instance.getBase().getTile();
    this.x = center.getX() * SCALE;
    this.y = center.getY() * SCALE;
    this.viewport.animate({
      time: 0,
      position: { x: this.x, y: this.y },
    });

    this.registerEventHandlers();
  }

  private renderTilemap() {
    this.tilemap!.clear();

    const atlas = this.loader.resources["atlas"];

    const rows = this.surface.getHeight();
    for (let i = 0; i < rows; i++) {
      this.surface.getRow(i).forEach((tile) => {
        let ref = TILE_TO_ATLAS_MAP[tile.getBaseType()];
        if (ref) {
          this.tilemap!.tile(
            atlas.textures![ref],
            tile.getX() * SCALE,
            tile.getY() * SCALE
          );

          if (tile.getBaseType() === TileType.Water) {
            this.tilemap!.tileAnimX(64, 2);
          }
        }

        if (tile.hasStaticEntity()) {
          if (tile.getType() === TileType.Tree) {
            this.tilemap!.tile(
              atlas.textures![AtlasTile.Tree],
              tile.getX() * SCALE,
              tile.getY() * SCALE
            );
          } else if (tile.getType() === TileType.Rock) {
            this.tilemap!.tile(
              atlas.textures![AtlasTile.Rock],
              tile.getX() * SCALE,
              tile.getY() * SCALE
            );
          }
        }
      });
    }
  }

  rerender(dt: number): void {
    if (this.loader.loading) {
      return;
    }

    this.time += dt;

    this.app!.renderer.plugins.tilemap.tileAnim[0] += dt / 500;

    this.renderSelection();

  }

  private renderSelection() {
    const scale = SCALE * (this.controller.getPlacable()?.entity?.scale || 1);

    this.selection!.clear();
    this.selection!.lineStyle(2, 0x000000);
    if (this.controller.isMouseDown()) {
      this.controller.getSelection().forEach((tile) => {
        this.selection!.drawRect(
          tile.getX() * SCALE,
          tile.getY() * SCALE,
          scale,
          scale
        );
      });
    } else {
      const [x, y] = this.controller.getMouse();
      this.selection!.drawRect(x * SCALE, y * SCALE, scale, scale);
    }
  }

  showCoverage(): void {}

  hideCoverage(): void {}

  unmount(): void {
    throw new Error("Method not implemented.");
  }

  getTime() {
    return this.time;
  }

  private registerEventHandlers() {
    this.target!.addEventListener("contextmenu", (event: Event) => {
      event.preventDefault();
      return false;
    });

    this.viewport!.addListener("mousedown", (event: InteractionEvent) => {
      const x = Math.floor((event.data.global.x - this.viewport!.x) / SCALE);
      const y = Math.floor((event.data.global.y - this.viewport!.y) / SCALE);

      this.controller.mouseDown(x, y);
    });

    this.viewport!.addListener("mousemove", (event: InteractionEvent) => {
      const x = Math.floor((event.data.global.x - this.viewport!.x) / SCALE);
      const y = Math.floor((event.data.global.y - this.viewport!.y) / SCALE);

      this.controller.mouseMove(x, y);
    });

    this.viewport!.addListener("mouseup", (event: InteractionEvent) => {
      const x = Math.floor((event.data.global.x - this.viewport!.x) / SCALE);
      const y = Math.floor((event.data.global.y - this.viewport!.y) / SCALE);

      this.controller.mouseUp(x, y);
    });

    window.addEventListener("keydown", (event: KeyboardEvent) => {
      this.controller.keyDown(event.key);
      event.preventDefault();
    });

    window.addEventListener("keyup", (event: KeyboardEvent) => {
      this.controller.keyUp(event.key);
      event.preventDefault();
    });
  }

  showMessage: MessageFn = async (...args) => {
    const fn = await this.messageFn;
    return fn(...args);
  };

  move({ x = 0, y = 0, zoom }: { x?: number; y?: number; zoom?: number }) {
    if (zoom) {
      if (zoom < 0) {
        this.scale = Math.max(MIN_SCALE, this.scale * 0.9);
      } else {
        this.scale = Math.min(MAX_SCALE, this.scale * 1.1);
      }
    }

    const xOffset = this.viewport!.worldScreenWidth / 2;
    const yOffset = this.viewport!.worldScreenHeight / 2;

    if (
      (x > 0 && this.x < this.width - xOffset) ||
      (x < 0 && this.x > xOffset)
    ) {
      this.x += (x * SCROLL_SPEED) / this.scale;
    }
    if (
      (y > 0 && this.y < this.height - yOffset) ||
      (y < 0 && this.y > yOffset)
    ) {
      this.y += (y * SCROLL_SPEED) / this.scale;
    }

    this.viewport!.animate({
      time: 200,
      position: { x: this.x, y: this.y },
      scale: this.scale,
    });
  }
}
export default Renderer;
