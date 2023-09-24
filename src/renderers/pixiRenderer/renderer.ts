import { App, createApp } from "vue";
import Controller from "../../data/controllers/controller";
import Surface from "../../data/terrain/surface";
import { IRenderer, MessageFn } from "../api";
import SimpleMessage from "../../components/SimpleMessage.vue";
import {
  Application,
  BaseTexture,
  FederatedPointerEvent,
  SCALE_MODES,
  SimplePlane,
  Texture,
} from "pixi.js";
import { Viewport } from "pixi-viewport";
import Manager from "../../data/controllers/manager";
import { Default } from "./overrides/default";
import { OVERRIDES } from "./overrides";
import { playSoundOnEvent, Sound, soundAssets, updateVolume } from "./sound";
import { CoverageRenderer } from "./tilemap/coverageRenderer";
import { AlertRenderer } from "./tilemap/alertRenderer";
import { getCenter } from "../../data/entity/staticEntity";
import { FOLIAGE, LAYERS } from "./layer";
import { EntityRenderer, EntityRendererStatics } from "./overrides/types";
import {
  DEFAULT_SCALE,
  MAX_SCALE,
  MIN_SCALE,
  SCALE,
  SCROLL_SPEED,
} from "./constants";
import WaveController from "../../data/controllers/waveController";
import { sound } from "@pixi/sound";
import { GameEvent } from "../../data/events";
import { get } from "../../util/localStorage";
import { CursorRenderer } from "./tilemap/cursorRenderer";
import { AssetsContainer } from "./assets/container";
import { IWorldShader, WorldShader } from "./shaders/worldShader";
import EventSystem from "../../data/eventSystem";
import { Explosion } from "./explosion";
import { ControllableSound } from "./sound/controllableSound";
import { FallbackWorldShader } from "./shaders/FallbackWorldShader";
import BuildController from "../../data/controllers/buildController";
import { isWebGL2Supported } from "../../util/webgl";
import MusicController from "./sound/musicController";

const SHAKE_AMOUNT = 10;
const SHAKE_INTENSITY = 12;
const SHAKE_INTERVAL = 25;

const END_SEQUENCE_FIXED_DELAY = 300;
const END_SEQUENCE_VARIABLE_DELAY = 500;
const END_SEQUENCE_EXPLOSIONS = 0.3;

let DEBUG = false;

BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;

class Renderer implements IRenderer {
  private static instance: Renderer;

  private messageFn: Promise<MessageFn>;
  private resolveMessageFn!: (fn: MessageFn) => void;
  private removeEventListeners?: () => void;
  private intervalId = -1;

  private surface!: Surface;
  private target?: HTMLElement;
  private app?: Application<HTMLCanvasElement>;
  private viewport?: Viewport;
  private vueApp?: App<Element>;

  private sprites = new Map<number, EntityRenderer>();

  private assets: AssetsContainer;
  private coverageRenderer?: CoverageRenderer;
  private alertRenderer?: AlertRenderer;
  private cursorRenderer?: CursorRenderer;

  private worldShader!: IWorldShader;

  public x = 0;
  public y = 0;
  private scale = DEFAULT_SCALE;
  private width = 0;
  private height = 0;

  private time = 0;
  private nextExplosionTime = 0;
  private explosions = 0;
  private lockedTowers = false;

  static get Instance() {
    return this.instance;
  }

  constructor(private controller: Controller) {
    Renderer.instance = this;

    this.messageFn = new Promise(
      (resolve) => (this.resolveMessageFn = resolve)
    );

    this.assets = new AssetsContainer();

    window.debug = () => {
      DEBUG = !DEBUG;
      this.surface.forceRerender();
      this.renderWorld();
    };
  }

  mount(surface: Surface, target: HTMLDivElement): void {
    this.surface = surface;
    this.target = target;
    this.lockedTowers =
      surface.getTowers().size >= BuildController.Instance.getMaxTowers();

    this.worldShader = isWebGL2Supported
      ? new WorldShader(surface)
      : new FallbackWorldShader(surface);

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
      events: this.app.renderer.events,
    })
      .clamp({
        direction: "all",
        underflow: "center",
      })
      .drag({ wheel: true, clampWheel: true, pressDrag: false })
      .pinch()
      .addListener("moved", ({ type }: { type: string }) => {
        if (type !== "animate") {
          this.x = this.viewport!.center.x;
          this.y = this.viewport!.center.y;
        }
      });

    this.app.stage.addChild(this.viewport);

    // Texture needs to be at least 1*1 pixel to be rendered.
    const texture = new Texture(
      new BaseTexture(undefined, {
        width: 1,
        height: 1,
      })
    );

    const world = new SimplePlane(texture, 2, 2);
    world.width = this.surface.getWidth() * SCALE;
    world.height = this.surface.getWidth() * SCALE;
    world.shader = this.worldShader;

    this.viewport!.addChild(world, ...LAYERS);

    this.coverageRenderer = new CoverageRenderer(this.assets, this.surface);
    this.alertRenderer = new AlertRenderer(this.assets);
    this.cursorRenderer = new CursorRenderer();

    this.assets.onComplete(() => {
      this.renderWorld();
      this.updateSettings();
    });

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
  }

  updateSettings() {
    const settings = get("settings");

    Object.keys(soundAssets).forEach((alias) =>
      updateVolume(alias as Sound, (settings?.volume ?? 50) / 100)
    );

    MusicController.Instance.updateVolume((settings?.musicVolume ?? 66) / 100);
  }

  private renderWorld() {
    const revealEverything = DEBUG || Manager.Instance.getIsBaseDestroyed();
    this.worldShader.render(revealEverything);

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
      this.renderWorld();
    }

    this.worldShader.setTime(this.time);

    const entities = full
      ? this.surface.getEntities()
      : this.surface.getTickingEntities();
    const deletedEntities = [...this.surface.getDeletedEntities()];

    let shouldSortFoliage = false;
    for (let entity of entities) {
      let sprite = this.sprites.get(entity.getId());
      const isVisible = entity.getAgent().isVisible() || revealEverything;

      if (!sprite) {
        const override = OVERRIDES[entity.getAgent().getType()];

        if (override === null || !isVisible) {
          continue;
        }

        const constructor = override || Default;

        sprite = new constructor(entity.getAgent(), this.assets);
        sprite.zIndex = entity.getAlignedY();
        constructor.layer.addChild(sprite);

        if (constructor.layer === FOLIAGE) {
          shouldSortFoliage = true;
        }

        this.sprites.set(entity.getId(), sprite);
      }

      if (isVisible) {
        sprite.sync(dt, full);
      } else {
        deletedEntities.push(entity);
      }
    }

    deletedEntities.forEach((entity) => {
      const sprite = this.sprites.get(entity.getId());
      if (sprite) {
        this.sprites.delete(entity.getId());

        const layer = (sprite.constructor as unknown as EntityRendererStatics)
          .layer;
        layer.removeChild(sprite);
      }
    });

    if (shouldSortFoliage) {
      FOLIAGE.sortChildren();
    }

    this.cursorRenderer!.render();
    this.coverageRenderer!.update(dt);
    this.alertRenderer!.update(dt, Manager.Instance.getIsStarted());
    this.surface.markPristine();

    if (
      Manager.Instance.getIsBaseDestroyed() &&
      this.time > this.nextExplosionTime &&
      this.explosions <
        END_SEQUENCE_EXPLOSIONS * Manager.Instance.getBase().getParts().size
    ) {
      const baseParts = [...Manager.Instance.getBase().getParts()];
      const basePart = baseParts[Math.floor(Math.random() * baseParts.length)];
      this.explosions++;
      this.nextExplosionTime =
        this.time +
        END_SEQUENCE_FIXED_DELAY +
        END_SEQUENCE_VARIABLE_DELAY / baseParts.length;

      new Explosion(this.assets, ...getCenter(basePart), 2);
      this.shake();
      ControllableSound.fromEntity(basePart.entity, Sound.Explosion);
    }
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
      this.alertRenderer!.unmount();

      this.messageFn = new Promise(
        (resolve) => (this.resolveMessageFn = resolve)
      );
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

    const handleMousedown = (event: FederatedPointerEvent) => {
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
    this.viewport!.addListener("pointerdown", handleMousedown);

    const handleMousemove = (event: FederatedPointerEvent) => {
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
    this.viewport!.addListener("pointermove", handleMousemove);

    const handleMouseup = (event: FederatedPointerEvent) => {
      const x = Math.floor(
        (event.data.global.x / this.viewport!.scale.x + this.viewport!.left) /
          SCALE
      );
      const y = Math.floor(
        (event.data.global.y / this.viewport!.scale.y + this.viewport!.top) /
          SCALE
      );

      this.controller.mouseUp(x, y, event.pointerType === "touch");
    };
    this.viewport!.addListener("pointerup", handleMouseup);

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
    const removeBuySound = EventSystem.Instance.addEventListener(
      GameEvent.Buy,
      () => {
        sound.play(Sound.Place);

        const shouldLockTowers =
          this.surface.getTowers().size >=
          BuildController.Instance.getMaxTowers();

        if (shouldLockTowers !== this.lockedTowers) {
          window.setTimeout(() => sound.play(Sound.Lock), 150);
          this.lockedTowers = shouldLockTowers;
        }
      }
    );

    const removeSellSound = EventSystem.Instance.addEventListener(
      GameEvent.Sell,
      () => {
        sound.play(Sound.Destroy);

        const shouldLockTowers =
          this.surface.getTowers().size >=
          BuildController.Instance.getMaxTowers();

        if (shouldLockTowers !== this.lockedTowers) {
          window.setTimeout(() => sound.play(Sound.Lock), 150);
          this.lockedTowers = shouldLockTowers;
        }
      }
    );

    const removeHitBaseSound = EventSystem.Instance.addEventListener(
      GameEvent.HitBase,
      () => {
        sound.play(Sound.Destroy);
        this.shake();
      }
    );

    const removeBackgroundMusic = EventSystem.Instance.addEventListener(
      GameEvent.StartWave,
      ({ wave }) => {
        if (wave === 1 || wave % 10 === 0) {
          MusicController.Instance.queue([Sound.BossMusic]);
        }
      }
    );

    const removeEndBossMusic = EventSystem.Instance.addEventListener(
      GameEvent.EndWave,
      () => {
        MusicController.Instance.queue([Sound.ForHonor]);
      }
    );

    this.removeEventListeners = () => {
      window.removeEventListener("contextmenu", handleContextmenu);
      this.viewport!.removeListener("pointerdown", handleMousedown);
      this.viewport!.removeListener("pointermove", handleMousemove);
      this.viewport!.removeListener("pointerup", handleMouseup);
      window.removeEventListener("keydown", handleKeydown);
      window.removeEventListener("keyup", handleKeyup);

      removeStartWaveSound();
      removeBuySound();
      removeSellSound();
      removeHitBaseSound();
      removeBackgroundMusic();
      removeEndBossMusic();
    };
  }

  showMessage: MessageFn = async (...args) => {
    const fn = await this.messageFn;

    if (sound.exists(Sound.Notification)) {
      sound.play(Sound.Notification);
    }
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

    window.clearInterval(this.intervalId);
    this.viewport!.animate({
      time: 200,
      position: { x: this.x, y: this.y },
      scale: this.scale,
    });
  }

  shake() {
    window.clearInterval(this.intervalId);

    let shakes = SHAKE_AMOUNT;
    this.intervalId = window.setInterval(() => {
      this.viewport!.animate({
        time: SHAKE_INTERVAL,
        position: {
          x:
            this.x +
            Math.floor((Math.random() * SHAKE_INTENSITY) / 2) -
            SHAKE_INTENSITY,
          y:
            this.y +
            Math.floor((Math.random() * SHAKE_INTENSITY) / 2) -
            SHAKE_INTENSITY,
        },
      });

      shakes--;
      if (shakes <= 0) {
        window.clearInterval(this.intervalId);
        this.intervalId = -1;
      }
    }, SHAKE_INTERVAL);
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
