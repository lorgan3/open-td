import { App, createApp } from "vue";
import Controller from "../../data/controllers/controller";
import Surface from "../../data/terrain/surface";
import { IRenderer, MessageFn } from "../api";
import SimpleMessage from "../../components/SimpleMessage.vue";
import { Application, InteractionEvent } from "pixi.js";
import { CompositeTilemap } from "@pixi/tilemap";
import { ATLAS, AtlasTile, TILE_TO_ATLAS_MAP } from "./atlas";
import { Viewport } from "pixi-viewport";
import { settings } from "@pixi/tilemap";
import Tile from "../../data/terrain/tile";
import Manager from "../../data/controllers/manager";
import { Default } from "./overrides/default";
import { OVERRIDES } from "./overrides";
import { init as initSound, playSoundOnEvent, Sound } from "./sound";
import { WallRenderer } from "./tilemap/wallRenderer";
import { wallTypes } from "./tilemap/constants";
import { CoverageRenderer } from "./tilemap/coverageRenderer";
import { AlertRenderer } from "./tilemap/alertRenderer";
import { getCenter } from "../../data/entity/staticEntity";
import { LAYERS } from "./layer";
import { EntityRenderer, EntityRendererStatics } from "./overrides/types";
import {
  DEFAULT_SCALE,
  MAX_SCALE,
  MIN_SCALE,
  SCALE,
  SCROLL_SPEED,
} from "./constants";
import { DiscoveryStatus, TileType } from "../../data/terrain/constants";
import WaveController from "../../data/controllers/waveController";
import { sound } from "@pixi/sound";
import { GameEvent } from "../../data/events";
import { get } from "../../util/localStorage";
import { CursorRenderer } from "./tilemap/cursorRenderer";
import { AssetsContainer } from "./assets/container";

let DEBUG = false;

settings.use32bitIndex = true;

class Renderer implements IRenderer {
  private static instance: Renderer;

  private messageFn: Promise<MessageFn>;
  private resolveMessageFn!: (fn: MessageFn) => void;
  private removeEventListeners?: () => void;

  private target?: HTMLElement;
  private app?: Application;
  private viewport?: Viewport;
  private tilemap: CompositeTilemap;
  private vueApp?: App<Element>;

  private sprites = new Map<number, EntityRenderer>();

  private assets: AssetsContainer;
  private wallRenderer: WallRenderer;
  private coverageRenderer?: CoverageRenderer;
  private alertRenderer?: AlertRenderer;
  private cursorRenderer?: CursorRenderer;

  public x = 0;
  public y = 0;
  private scale = DEFAULT_SCALE;
  private width = 0;
  private height = 0;

  private time = 0;

  static get Instance() {
    return this.instance;
  }

  constructor(private surface: Surface, private controller: Controller) {
    Renderer.instance = this;

    this.messageFn = new Promise(
      (resolve) => (this.resolveMessageFn = resolve)
    );

    this.tilemap = new CompositeTilemap();
    this.assets = new AssetsContainer();

    this.wallRenderer = new WallRenderer(
      this.assets,
      this.tilemap,
      this.surface
    );

    initSound();

    window.debug = () => {
      DEBUG = !DEBUG;
      this.renderTilemap();
    };
  }

  mount(target: HTMLDivElement): void {
    this.target = target;

    this.app = new Application({
      resizeTo: window,
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

    this.coverageRenderer = new CoverageRenderer(this.assets, this.surface);
    this.alertRenderer = new AlertRenderer(this.assets);
    this.cursorRenderer = new CursorRenderer();

    this.assets.onComplete(() => this.renderTilemap());

    const container = target.appendChild(document.createElement("div"));
    this.vueApp = createApp(SimpleMessage, {
      register: this.resolveMessageFn,
    });
    this.vueApp.mount(container);

    const center = Manager.Instance.getBase().getTile();
    this.x = center.getX() * SCALE;
    this.y = center.getY() * SCALE;
    this.viewport.animate({
      time: 0,
      position: { x: this.x, y: this.y },
    });

    this.registerEventHandlers();
    this.updateSettings();
  }

  updateSettings() {
    const settings = get("settings");
    sound.volumeAll = (settings?.volume ?? 100) / 100;
  }

  private renderTilemap() {
    this.tilemap.clear();

    const revealEverything = DEBUG || Manager.Instance.getIsBaseDestroyed();
    const atlas = this.assets.assets![ATLAS];
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
    const alerts = WaveController.Instance.getSpawnAlertRanges();
    this.alertRenderer!.render(center, alerts);
  }

  rerender(dt: number): void {
    if (this.assets.loading) {
      return;
    }

    this.time += dt;
    const revealEverything = DEBUG || Manager.Instance.getIsBaseDestroyed();
    const full = this.surface.isDirty();
    if (full) {
      this.renderTilemap();
    }

    this.app!.renderer.plugins.tilemap.tileAnim[0] += dt / 500;

    const entities = this.surface.getEntities();
    for (let entity of entities) {
      let sprite = this.sprites.get(entity.getId());

      if (!sprite) {
        const override = OVERRIDES[entity.getAgent().getType()];

        if (override === null) {
          continue;
        }

        const constructor = override || Default;

        sprite = new constructor(entity.getAgent(), this.assets);
        constructor.layer.addChild(sprite);

        this.sprites.set(entity.getId(), sprite);
      }

      if (entity.getAgent().isVisible() || revealEverything) {
        sprite.sync(dt, full);
        sprite.visible = true;

        if (sprite.shadow) {
          sprite.shadow.visible = true;
        }
      } else {
        sprite.visible = false;

        if (sprite.shadow) {
          sprite.shadow.visible = false;
        }
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

    this.cursorRenderer!.render();
    this.coverageRenderer!.update();
    this.alertRenderer!.update(dt, Manager.Instance.getIsStarted());
    this.surface.markPristine();
  }

  showCoverage(): void {
    this.coverageRenderer!.show();
    this.alertRenderer!.enable();
  }

  hideCoverage(): void {
    this.coverageRenderer!.hide();
    this.alertRenderer!.disable();
  }

  unmount(): void {
    if (this.app) {
      this.vueApp!.unmount();
      this.app.destroy(true);
      this.removeEventListeners!();
      LAYERS.forEach((layer) => layer.removeChildren());
    }
  }

  getTime() {
    return this.time;
  }

  private registerEventHandlers() {
    const handleContextmenu = (event: Event) => {
      event.preventDefault();
      return false;
    };
    this.target!.addEventListener("contextmenu", handleContextmenu);

    const handleMousedown = (event: InteractionEvent) => {
      const x = Math.floor(
        (event.data.global.x / this.viewport!.scale.x + this.viewport!.left) /
          SCALE
      );
      const y = Math.floor(
        (event.data.global.y / this.viewport!.scale.y + this.viewport!.top) /
          SCALE
      );

      this.controller.mouseDown(x, y);
    };
    this.viewport!.addListener("mousedown", handleMousedown);

    const handleMousemove = (event: InteractionEvent) => {
      const x = Math.floor(
        (event.data.global.x / this.viewport!.scale.x + this.viewport!.left) /
          SCALE
      );
      const y = Math.floor(
        (event.data.global.y / this.viewport!.scale.y + this.viewport!.top) /
          SCALE
      );

      this.controller.mouseMove(x, y);
    };
    this.viewport!.addListener("mousemove", handleMousemove);

    const handleMouseup = (event: InteractionEvent) => {
      const x = Math.floor(
        (event.data.global.x / this.viewport!.scale.x + this.viewport!.left) /
          SCALE
      );
      const y = Math.floor(
        (event.data.global.y / this.viewport!.scale.y + this.viewport!.top) /
          SCALE
      );

      this.controller.mouseUp(x, y);
    };
    this.viewport!.addListener("mouseup", handleMouseup);

    const handleKeydown = (event: KeyboardEvent) => {
      this.controller.keyDown(event.key);
      event.preventDefault();
    };
    window.addEventListener("keydown", handleKeydown);

    const handleKeyup = (event: KeyboardEvent) => {
      this.controller.keyUp(event.key);
      event.preventDefault();
    };
    window.addEventListener("keyup", handleKeyup);

    const removeStartWaveSound = playSoundOnEvent(
      GameEvent.StartWave,
      Sound.Sonar
    );
    const removeBuySound = playSoundOnEvent(GameEvent.Buy, Sound.Place);
    const removeSellSound = playSoundOnEvent(GameEvent.Sell, Sound.Destroy);
    const removeHitBaseSound = playSoundOnEvent(
      GameEvent.HitBase,
      Sound.Destroy
    );

    this.removeEventListeners = () => {
      window.removeEventListener("contextmenu", handleContextmenu);
      this.viewport!.removeListener("mousedown", handleMousedown);
      this.viewport!.removeListener("mousemove", handleMousemove);
      this.viewport!.removeListener("mouseup", handleMouseup);
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("keyup", handleKeyup);

      removeStartWaveSound();
      removeBuySound();
      removeSellSound();
      removeHitBaseSound();
    };
  }

  showMessage: MessageFn = async (...args) => {
    const fn = await this.messageFn;

    sound.play(Sound.Notification);
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

  getViewport() {
    return {
      x: this.x,
      y: this.y,
      width: this.viewport?.worldScreenWidth || 0,
      height: this.viewport?.worldScreenHeight || 0,
      scale: this.scale,
    };
  }
}

export default Renderer;
