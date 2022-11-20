import { createApp } from "vue";
import Controller from "../../data/controllers/controller";
import Surface from "../../data/terrain/surface";
import { IRenderer, MessageFn } from "../api";
import SimpleMessage from "../../components/SimpleMessage.vue";

import { Application, Graphics, InteractionEvent, Loader } from "pixi.js";
import { CompositeTilemap } from "@pixi/tilemap";
import { ATLAS, AtlasTile, TILE_TO_ATLAS_MAP } from "./atlas";
import { Viewport } from "pixi-viewport";
import { settings } from "@pixi/tilemap";
import Tile, { DiscoveryStatus, TileType } from "../../data/terrain/tile";
import Manager from "../../data/controllers/manager";
import { Default } from "./overrides/default";
import {
  EntityRenderer,
  EntityRendererStatics,
  init,
  OVERRIDES,
} from "./overrides";
import { WallRenderer } from "./tilemap/wallRenderer";
import { wallTypes } from "./tilemap/constants";
import { CoverageRenderer } from "./tilemap/coverageRenderer";
import { AlertRenderer } from "./tilemap/alertRenderer";
import { getCenter } from "../../data/entity/staticEntity";
import { LAYERS, UI } from "./layer";

let DEBUG = false;
export const SCALE = 32;
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
  private tilemap: CompositeTilemap;

  private sprites = new Map<number, EntityRenderer>();
  private selection?: Graphics;

  private loader: Loader;
  private wallRenderer: WallRenderer;
  private coverageRenderer?: CoverageRenderer;
  private alertRenderer?: AlertRenderer;

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

    this.tilemap = new CompositeTilemap();

    this.loader = new Loader();
    this.loader.add(ATLAS, `${import.meta.env.BASE_URL}tiles/atlas.json`);
    this.wallRenderer = new WallRenderer(
      this.loader,
      this.tilemap,
      this.surface
    );
    init(this.loader);
    this.loader.load();

    window.debug = () => {
      DEBUG = !DEBUG;
      this.renderTilemap();
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

    this.viewport!.addChild(this.tilemap, ...LAYERS);

    this.coverageRenderer = new CoverageRenderer(this.loader, UI, this.surface);
    this.alertRenderer = new AlertRenderer(this.loader, UI);

    this.selection = new Graphics();
    UI.addChild(this.selection);

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
    this.tilemap.clear();

    const revealEverything = DEBUG || Manager.Instance.getIsBaseDestroyed();
    const atlas = this.loader.resources[ATLAS];
    const rows = this.surface.getHeight();
    const walls: Tile[] = [];
    for (let i = 0; i < rows; i++) {
      this.surface.getRow(i).forEach((tile) => {
        if (!revealEverything) {
          if (tile.getDiscoveryStatus() === DiscoveryStatus.Undiscovered) {
            return;
          }

          if (tile.getDiscoveryStatus() === DiscoveryStatus.Pending) {
            this.tilemap.tile(
              atlas.textures![AtlasTile.Unknown],
              tile.getX() * SCALE,
              tile.getY() * SCALE
            );
            return;
          }
        }

        let ref = TILE_TO_ATLAS_MAP[tile.getBaseType()];
        if (ref) {
          this.tilemap.tile(
            atlas.textures![ref],
            tile.getX() * SCALE,
            tile.getY() * SCALE
          );

          if (tile.getBaseType() === TileType.Water) {
            this.tilemap.tileAnimX(32, 2);
          }
        }

        if (tile.hasStaticEntity()) {
          if (tile.getType() === TileType.Tree) {
            this.tilemap.tile(
              atlas.textures![AtlasTile.Tree],
              tile.getX() * SCALE,
              tile.getY() * SCALE
            );
          } else if (tile.getType() === TileType.Rock) {
            this.tilemap.tile(
              atlas.textures![AtlasTile.Rock],
              tile.getX() * SCALE,
              tile.getY() * SCALE
            );
          } else if (
            wallTypes.has(tile.getType()) &&
            tile.isStaticEntityRoot()
          ) {
            walls.push(tile);
          }
        }
      });
    }

    walls.forEach((tile) => this.wallRenderer.render(tile));

    this.coverageRenderer!.render();

    const center = getCenter(Manager.Instance.getBase());
    const alerts = Manager.Instance.getSpawnAlertRanges();
    this.alertRenderer!.render(center, alerts);
  }

  rerender(dt: number): void {
    if (this.loader.loading) {
      return;
    }

    this.time += dt;
    const revealEverything = DEBUG || Manager.Instance.getIsBaseDestroyed();
    const full = this.surface.isDirty();
    if (full) {
      this.renderTilemap();
    }

    this.app!.renderer.plugins.tilemap.tileAnim[0] += dt / 500;

    this.renderSelection();

    const entities = this.surface.getEntities();
    for (let entity of entities) {
      let sprite = this.sprites.get(entity.getId());

      if (!sprite) {
        const override = OVERRIDES[entity.getAgent().getType()];

        if (override === null) {
          continue;
        }

        const constructor = override || Default;

        sprite = new constructor(entity.getAgent(), this.loader);
        constructor.layer.addChild(sprite);

        this.sprites.set(entity.getId(), sprite);
      }

      if (entity.getAgent().isVisible() || revealEverything) {
        sprite.sync(dt, full);
        sprite.visible = true;
      } else {
        sprite.visible = false;
      }
    }

    const deletedEntities = this.surface.getDeletedEntities();
    deletedEntities.forEach((entity) => {
      const sprite = this.sprites.get(entity.getId());
      if (sprite) {
        this.sprites.delete(entity.getId());

        const layer = (sprite.constructor as unknown as EntityRendererStatics)
          .layer;
        layer.removeChild(sprite);
      }
    });

    this.coverageRenderer!.update();
    this.alertRenderer!.update(dt, Manager.Instance.getIsStarted());
    this.surface.markPristine();
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

  showCoverage(): void {
    this.coverageRenderer!.show();
  }

  hideCoverage(): void {
    this.coverageRenderer!.hide();
  }

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
      const x = Math.floor(
        (event.data.global.x / this.viewport!.scale.x + this.viewport!.left) /
          SCALE
      );
      const y = Math.floor(
        (event.data.global.y / this.viewport!.scale.y + this.viewport!.top) /
          SCALE
      );

      this.controller.mouseDown(x, y);
    });

    this.viewport!.addListener("mousemove", (event: InteractionEvent) => {
      const x = Math.floor(
        (event.data.global.x / this.viewport!.scale.x + this.viewport!.left) /
          SCALE
      );
      const y = Math.floor(
        (event.data.global.y / this.viewport!.scale.y + this.viewport!.top) /
          SCALE
      );

      this.controller.mouseMove(x, y);
    });

    this.viewport!.addListener("mouseup", (event: InteractionEvent) => {
      const x = Math.floor(
        (event.data.global.x / this.viewport!.scale.x + this.viewport!.left) /
          SCALE
      );
      const y = Math.floor(
        (event.data.global.y / this.viewport!.scale.y + this.viewport!.top) /
          SCALE
      );

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
