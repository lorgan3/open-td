import { createApp } from "vue";
import Controller, { Keys } from "../../data/controller";
import Entity, { EntityType } from "../../data/entity/entity";
import Manager from "../../data/manager";
import Pool, { PoolType } from "../../data/pool";
import Surface from "../../data/terrain/surface";
import Tile, { TileType } from "../../data/terrain/tile";
import { IRenderer, MessageFn } from "../api";
import { OVERRIDES } from "./overrides";
import SimpleMessage from "../../components/SimpleMessage.vue";

const IS_WINDOWS = navigator.appVersion.indexOf("Win") != -1;
const MAX_FONT_SIZE = 42;
const MIN_FONT_SIZE = 4;
const DEFAULT_FONT_SIZE = 20;

let DEBUG = false;

declare global {
  interface Window {
    debug: () => void;
  }
}

class Renderer implements IRenderer {
  private pool: Pool<Entity, HTMLSpanElement>;
  private selectionPool: Pool<number, HTMLSpanElement>;
  private messageFn: Promise<MessageFn>;
  private resolveMessageFn!: (fn: MessageFn) => void;

  public xStep = 0;
  public yStep = 0;
  private offsetX = 0;
  private offsetY = 0;
  private time = 0;
  private fontSize = DEFAULT_FONT_SIZE;

  private _showCoverage = false;

  private target: HTMLDivElement | null = null;
  private world: HTMLDivElement | null = null;
  private rows: HTMLDivElement[] = [];

  private coverageMap: HTMLDivElement | null = null;
  private coverageRows: HTMLDivElement[] = [];

  constructor(private surface: Surface, private controller: Controller) {
    this.pool = new Pool(
      (active, original, entity) => {
        if (original) {
          original.style.display = "block";
          original.style.opacity = "1";
          original.style.transformOrigin = "50% 50%";
          original.style.filter = "none";
          original.children[0].textContent = this.getEntityEmoji(entity!);
          return original;
        }

        const htmlElement = document.createElement("span");
        htmlElement.appendChild(document.createElement("span"));
        if (IS_WINDOWS) {
          (htmlElement.children[0] as HTMLElement).style.margin = "-0.35ch";
        }

        htmlElement.children[0].textContent = entity
          ? this.getEntityEmoji(entity!)
          : "";
        htmlElement.style.position = "absolute";
        htmlElement.style.top = IS_WINDOWS ? "-.125ch" : "-.075ch";
        htmlElement.style.left = IS_WINDOWS ? ".35ch" : "0";
        htmlElement.style.display = active ? "block" : "none";
        htmlElement.style.willChange = "transform";

        this.world!.appendChild(htmlElement);

        return htmlElement;
      },
      PoolType.Growing,
      0
    );

    this.selectionPool = new Pool(
      (active, original) => {
        if (original) {
          original.style.display = "block";
          return original;
        }

        const htmlElement = document.createElement("span");
        htmlElement.appendChild(document.createElement("span"));
        if (IS_WINDOWS) {
          (htmlElement.children[0] as HTMLElement).style.margin = "-0.35ch";
        }

        htmlElement.children[0].textContent = "🟧";
        htmlElement.style.opacity = "0.7";
        htmlElement.style.position = "absolute";
        htmlElement.style.top = IS_WINDOWS ? "-.125ch" : "-.075ch";
        htmlElement.style.left = IS_WINDOWS ? ".35ch" : "0";
        htmlElement.style.display = active ? "block" : "none";
        htmlElement.style.willChange = "transform";

        this.world!.appendChild(htmlElement);

        return htmlElement;
      },
      PoolType.Growing,
      0
    );

    this.messageFn = new Promise(
      (resolve) => (this.resolveMessageFn = resolve)
    );

    window.debug = () => {
      DEBUG = !DEBUG;
      this.renderTiles();
    };
  }

  mount(target: HTMLDivElement): void {
    this.target = target;

    const container = target.appendChild(document.createElement("div"));
    createApp(SimpleMessage, {
      register: this.resolveMessageFn,
      test: "test",
    }).mount(container);

    this.world = target.appendChild(document.createElement("div"));

    this.world.style.overflow = "auto";
    this.world.style.width = "100%";
    this.world.style.height = "100%";
    this.world.style.lineHeight = IS_WINDOWS ? "1.86ch" : "1ch";
    this.world.style.whiteSpace = "nowrap";
    this.world.style.display = "inline-flex";
    this.world.style.flexDirection = "column";
    this.world.style.cursor = "crosshair";
    this.world.style.userSelect = "none";
    this.world.style.position = "relative";
    this.world.style.fontFamily =
      '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Android Emoji","EmojiOne Mozilla","Twemoji Mozilla","Noto Emoji","Segoe UI Symbol",EmojiSymbols';

    this.renderTiles();

    this.zoom();

    const { width, height } = this.world!.getBoundingClientRect();
    const center = Manager.Instance.getBase().getTile();
    this.world.scrollLeft = center.getX() * this.xStep - width / 2;
    this.world.scrollTop = center.getY() * this.yStep - height / 2;

    this.rerender(0);

    this.registerEventHandlers(this.world);
  }

  private zoom() {
    const xPercent =
      (this.world!.scrollLeft + this.world!.clientWidth / 2) /
      this.world!.scrollWidth;
    const yPercent =
      (this.world!.scrollTop + this.world!.clientHeight / 2) /
      this.world!.scrollHeight;

    this.world!.style.fontSize = `${this.fontSize}px`;

    const { width, height, x, y } = this.world!.getBoundingClientRect();
    const totalWidth = this.world!.scrollWidth;
    const totalHeight = this.world!.scrollHeight;

    this.xStep = totalWidth / this.surface.getWidth();
    this.yStep = totalHeight / this.surface.getHeight();
    this.offsetX = x;
    this.offsetY = y;

    this.world!.scrollLeft = xPercent * totalWidth - width / 2;
    this.world!.scrollTop = yPercent * totalHeight - height / 2;
  }

  rerender(dt: number): void {
    this.time += dt;

    if (this.surface.isDirty()) {
      this.renderTiles();
    }

    const entities = this.surface.getEntities();
    for (let entity of entities) {
      const fn = OVERRIDES[entity.getAgent().getType()];
      if (!this.getEntityEmoji(entity) && !fn) {
        continue;
      }

      const htmlElement = this.pool.get(entity);
      htmlElement.style.display = entity.getAgent().isVisible()
        ? "block"
        : "none";

      if (fn) {
        fn(this, entity.getAgent(), htmlElement);
      } else {
        htmlElement.style.transform = `translate(${
          entity.getX() * this.xStep
        }px, ${
          entity.getY() * this.yStep
        }px) rotate(${entity.getRotation()}deg)`;
      }
    }

    const deletedEntities = this.surface.getDeletedEntities();
    deletedEntities.forEach((entity) => {
      const htmlElement = this.pool.free(entity);
      if (htmlElement) {
        htmlElement.style.display = "none";
      }
    });

    this.renderSelection();
    this.surface.markPristine();
  }

  showCoverage(): void {
    this._showCoverage = true;
    this.renderTiles();
  }

  hideCoverage(): void {
    this._showCoverage = false;
    this.renderTiles();
  }

  private renderTiles() {
    const rows = this.surface.getHeight();
    for (let i = 0; i < rows; i++) {
      let row = this.rows[i];
      if (!row) {
        row = document.createElement("div");
        if (IS_WINDOWS) {
          row.style.letterSpacing = "-0.7ch";
        }

        this.rows[i] = row;
        this.world!.appendChild(row);
      }

      const content = this.surface.getRow(i).map(this.getEmoji).join("");
      row.textContent = content;
    }

    this.renderCoverage();
  }

  private renderCoverage() {
    if (!this.coverageMap) {
      this.coverageMap = document.createElement("div");
      this.coverageMap.style.opacity = "0.5";
      this.coverageMap.style.position = "absolute";
      this.coverageMap.style.top = "0";
      this.coverageMap.style.left = IS_WINDOWS ? "-0.125ch" : "0";
      if (IS_WINDOWS) {
        this.coverageMap.style.letterSpacing = "-0.7ch";
        this.coverageMap.style.wordSpacing = "2.04ch";
      }

      this.world!.appendChild(this.coverageMap);
    }

    if (this._showCoverage) {
      this.coverageMap.style.display = "block";
    } else {
      this.coverageMap.style.display = "none";
    }

    const rows = this.surface.getHeight();
    for (let i = 0; i < rows; i++) {
      let row = this.coverageRows[i];
      if (!row) {
        row = document.createElement("div");
        this.coverageRows[i] = row;
        this.coverageMap.appendChild(row);
      }

      const content = this.surface
        .getRow(i)
        .map((tile) => (tile.isCoveredByTower() ? "🟥" : "&nbsp;"))
        .join("");
      row.innerHTML = content;
    }
  }

  private renderSelection() {
    const usedTiles = this.selectionPool.getUsed();
    let selection = this.controller.getSelection();
    if (selection.length === 1) {
      selection = [];
    }

    selection.forEach((tile, i) => {
      const htmlElement = usedTiles.has(i)
        ? usedTiles.get(i)!
        : this.selectionPool.get(i);

      htmlElement.style.transform = `translate(${tile.getX() * this.xStep}px, ${
        tile.getY() * this.yStep
      }px)`;
    });

    for (let i = usedTiles.size - 1; i >= selection.length; i--) {
      const htmlElement = this.selectionPool.free(i);
      if (htmlElement) {
        htmlElement.style.display = "none";
      }
    }
  }

  unmount(): void {
    throw new Error("Method not implemented.");
  }

  getTime() {
    return this.time;
  }

  private registerEventHandlers(target: HTMLDivElement) {
    target.addEventListener("contextmenu", (event: Event) => {
      event.preventDefault();
      return false;
    });

    const preventMovement = (deltaX: number, deltaY: number, event: Event) => {
      if (DEBUG) {
        return;
      }

      const bbox = this.getBBox();
      const constraints = Manager.Instance.getVisibilityController().getBBox();

      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0 && bbox[0][0] <= constraints[0][0]) {
          event.preventDefault();
          return;
        }

        if (deltaX > 0 && bbox[1][0] >= constraints[1][0]) {
          event.preventDefault();
          return;
        }
      } else {
        if (deltaY < 0 && bbox[0][1] <= constraints[0][1]) {
          event.preventDefault();
          return;
        }

        if (deltaY > 0 && bbox[1][1] >= constraints[1][1]) {
          event.preventDefault();
          return;
        }
      }
    };

    target.addEventListener(
      "wheel",
      (event: WheelEvent) => {
        preventMovement(event.deltaX, event.deltaY, event);
      },
      { passive: false }
    );

    target.addEventListener("mousedown", (event: MouseEvent) => {
      const x = Math.floor(
        (event.pageX - this.offsetX + this.world!.scrollLeft) / this.xStep
      );
      const y = Math.floor(
        (event.pageY - this.offsetY + this.world!.scrollTop) / this.yStep
      );

      this.controller.mouseDown(x, y);
    });

    target.addEventListener("mousemove", (event: MouseEvent) => {
      const x = Math.floor(
        (event.pageX - this.offsetX + this.world!.scrollLeft) / this.xStep
      );
      const y = Math.floor(
        (event.pageY - this.offsetY + this.world!.scrollTop) / this.yStep
      );

      this.controller.mouseMove(x, y);
    });

    target.addEventListener("mouseup", (event: MouseEvent) => {
      const x = Math.floor(
        (event.pageX - this.offsetX + this.world!.scrollLeft) / this.xStep
      );
      const y = Math.floor(
        (event.pageY - this.offsetY + this.world!.scrollTop) / this.yStep
      );

      this.controller.mouseUp(x, y);
    });

    window.addEventListener("keydown", (event: KeyboardEvent) => {
      this.controller.keyDown(event.key);
    });

    window.addEventListener("keyup", (event: KeyboardEvent) => {
      this.controller.keyUp(event.key);

      let originalFontSize = this.fontSize;
      if (event.key === Keys.Minus) {
        this.fontSize = Math.max(MIN_FONT_SIZE, this.fontSize * 0.8);
      } else if (event.key === Keys.Plus || event.key === Keys.Equals) {
        this.fontSize = Math.min(MAX_FONT_SIZE, this.fontSize * 1.2);
      }

      if (this.fontSize !== originalFontSize) {
        this.zoom();
      }
    });
  }

  async showMessage(content: string) {
    const fn = await this.messageFn;
    fn(content);
  }

  public getStaticEntityEmoji(entityType: EntityType) {
    switch (entityType) {
      case EntityType.Tower:
        return "🗼";
      case EntityType.Wall:
        return "🧱";
      case EntityType.Mortar:
        return "🛰️";
      case EntityType.Flamethrower:
        return "🧯";
      case EntityType.Railgun:
        return "🌡️";
      case EntityType.ElectricFence:
        return "⚡";
      case EntityType.Fence:
        return "🥅";
      case EntityType.Freezer:
        return "❄️";
      case EntityType.Base:
        return "⛺";
      case EntityType.Tree:
        return "🌲";
      case EntityType.Rock:
        return "🪨";
      case EntityType.Radar:
        return "📡";
      case EntityType.PowerPlant:
        return "🏭";
      case EntityType.None:
        return "❌";
      default:
        return "❓";
    }
  }

  private getEmoji = (tile: Tile) => {
    if (tile.hasStaticEntity()) {
      if (!tile.getStaticEntity()!.getAgent().isVisible() && !DEBUG) {
        return "🌌";
      }

      return this.getStaticEntityEmoji(
        tile.getStaticEntity()!.getAgent().getType()
      );
    }

    if (!tile.isDiscovered() && !DEBUG) {
      return "🌌";
    }

    switch (tile.getBaseType()) {
      case TileType.Water:
        return "🟦";
      case TileType.Stone:
        return "⬜";
      case TileType.Grass:
        return "🟩";
      case TileType.Spore:
        return "🟪";
      case TileType.Bridge:
        return "📜";
      case TileType.Sand:
        return "🟨";
      case TileType.Snow:
        return "🌫️";
      case TileType.Dirt:
        return "🟫";
      case TileType.Ice:
        return "🧊";
      default:
        return "🌌";
    }
  };

  private getEntityEmoji(entity: Entity) {
    switch (entity.getAgent().getType()) {
      case EntityType.Slime:
        return "🐞";
      case EntityType.Bullet:
        return "▪";
      case EntityType.Rail:
        return "〰";
      case EntityType.Flame:
        return "🔥";
      case EntityType.Shockwave:
        return "🌀";
      default:
        return "";
    }
  }

  private getBBox() {
    const scrollTop = this.world!.scrollTop / this.yStep;
    const scrollLeft = this.world!.scrollLeft / this.xStep;
    const height = this.world!.clientHeight / this.yStep;
    const width = this.world!.clientWidth / this.xStep;

    return [
      [scrollLeft, scrollTop],
      [scrollLeft + width, scrollTop + height],
    ];
  }
}
export default Renderer;
