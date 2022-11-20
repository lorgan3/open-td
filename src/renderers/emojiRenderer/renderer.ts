import { createApp } from "vue";
import Controller from "../../data/controllers/controller";
import Entity from "../../data/entity/entity";
import Manager from "../../data/controllers/manager";
import Pool, { PoolType } from "../../data/pool";
import Surface from "../../data/terrain/surface";
import Tile from "../../data/terrain/tile";
import { IRenderer, MessageFn } from "../api";
import { OVERRIDES } from "./overrides";
import SimpleMessage from "../../components/SimpleMessage.vue";
import {
  getCenter,
  getScale,
  isStaticAgent,
} from "../../data/entity/staticEntity";
import { Difficulty } from "../../data/difficulty";
import { AgentCategory, EntityType } from "../../data/entity/constants";
import { DiscoveryStatus, TileType } from "../../data/terrain/constants";

const IS_WINDOWS = navigator.appVersion.indexOf("Win") != -1;
const MAX_FONT_SIZE = 42;
const MIN_FONT_SIZE = 4;
const DEFAULT_FONT_SIZE = 20;

let DEBUG = false;

class Renderer implements IRenderer {
  private pool: Pool<Entity, HTMLSpanElement>;
  private selectionPool: Pool<number, HTMLSpanElement>;
  private scaledTilesPool: Pool<Entity, HTMLSpanElement>;
  private messageFn: Promise<MessageFn>;
  private resolveMessageFn!: (fn: MessageFn) => void;

  public xStep = 0;
  public yStep = 0;
  private offsetX = 0;
  private offsetY = 0;
  private time = 0;
  private fontSize = DEFAULT_FONT_SIZE;
  private hasMoved = false;

  private _showCoverage = false;

  private target: HTMLDivElement | null = null;
  private world: HTMLDivElement | null = null;
  private rows: HTMLDivElement[] = [];
  private alertRanges: SVGElement[] = [];

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
          original.style.color = "initial";
          original.style.textShadow = "none";
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
        htmlElement.style.transformOrigin = "0 0";
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

    this.scaledTilesPool = new Pool(
      (active, original, entity) => {
        if (original) {
          original.style.display = "block";
          original.children[0].textContent = this.getStaticEntityEmoji(
            entity!.getAgent().getType()
          );
          return original;
        }

        const htmlElement = document.createElement("span");
        htmlElement.appendChild(document.createElement("span"));
        if (IS_WINDOWS) {
          (htmlElement.children[0] as HTMLElement).style.margin = "-0.35ch";
        }

        htmlElement.children[0].textContent = entity
          ? this.getStaticEntityEmoji(entity.getAgent().getType())
          : "";
        htmlElement.style.transformOrigin = "0 0";

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
    }).mount(container);

    this.world = target.appendChild(document.createElement("div"));
    this.world.className = "scrollable";
    this.world.style.lineHeight = IS_WINDOWS ? "1.86ch" : "1ch";
    this.world.style.whiteSpace = "nowrap";
    this.world.style.cursor = "crosshair";
    this.world.style.userSelect = "none";
    this.world.style.position = "relative";
    this.world.style.fontFamily =
      '"Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji","Android Emoji","EmojiOne Mozilla","Twemoji Mozilla","Noto Emoji","Segoe UI Symbol",EmojiSymbols';
    this.world.style.backgroundColor = "#000";
    if (IS_WINDOWS) {
      this.world.style.letterSpacing = "-0.7ch";
      this.world.style.wordSpacing = "2.04ch";
    }

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

    if (this.surface.isDirty() || this.hasMoved) {
      this.renderStaticAgents();
      this.renderAlertRanges();
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
      row.innerHTML = content;
    }

    this.renderCoverage();
  }

  private renderStaticAgents() {
    const entities = this.surface.getEntitiesForCategory(AgentCategory.Player);
    for (let entity of entities) {
      const agent = entity.getAgent();
      if (isStaticAgent(agent) && getScale(agent) === 2) {
        const htmlElement = this.scaledTilesPool.get(entity);

        htmlElement.style.transform = `translate(${
          entity.getX() * this.xStep
        }px, ${entity.getY() * this.yStep}px) scale(2)`;
      }
    }

    const deletedEntities = this.surface.getDeletedEntities();
    deletedEntities.forEach((entity) => {
      const htmlElement = this.scaledTilesPool.free(entity);
      if (htmlElement) {
        htmlElement.style.display = "none";
      }
    });
  }

  private renderCoverage() {
    const revealEverything = DEBUG || Manager.Instance.getIsBaseDestroyed();

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
      return;
    }

    const tiles = new Set<Tile>();
    if (Manager.Instance.getDifficulty() === Difficulty.Easy) {
      Manager.Instance.getWaveController()
        .getSpawnGroups()
        .forEach((spawnGroup) =>
          spawnGroup
            .getSpawnPoints()[0]
            .getTiles()
            .forEach((tile) => tiles.add(tile))
        );
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
        .map((tile) => {
          if (!tile.isDiscovered() && !revealEverything) {
            return "&nbsp;";
          }

          const isCovered = tile.isCoveredByTower();
          return tiles.has(tile)
            ? isCovered
              ? "⚔️"
              : "🐾"
            : isCovered
            ? "🎯"
            : "&nbsp;";
        })
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

    const scale = this.controller.getPlacable()?.entity?.scale || 1;

    selection.forEach((tile, i) => {
      const htmlElement = usedTiles.has(i)
        ? usedTiles.get(i)!
        : this.selectionPool.get(i);

      htmlElement.style.transform = `translate(${tile.getX() * this.xStep}px, ${
        tile.getY() * this.yStep
      }px) scale(${scale})`;
    });

    for (let i = usedTiles.size - 1; i >= selection.length; i--) {
      const htmlElement = this.selectionPool.free(i);
      if (htmlElement) {
        htmlElement.style.display = "none";
      }
    }
  }

  private renderAlertRanges() {
    const [x, y] = getCenter(Manager.Instance.getBase());
    const width = 20 * this.xStep;
    const height = 20 * this.yStep;
    const ranges = Manager.Instance.getIsStarted()
      ? []
      : Manager.Instance.getWaveController().getSpawnAlertRanges();

    ranges.forEach((range, i) => {
      const length = range.getLength();
      const angle = range.getCenter();
      const degrees = length / 360;

      let htmlElement = this.alertRanges[i];
      if (!htmlElement) {
        this.alertRanges[i] = htmlElement = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "svg"
        );
        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        circle.setAttribute("cx", "50%");
        circle.setAttribute("cy", "50%");
        circle.setAttribute("r", "45%");
        circle.setAttribute("stroke", "url(#alert)");
        circle.setAttribute("stroke-linecap", "round");
        circle.setAttribute("fill", "none");

        htmlElement.appendChild(circle);

        const text = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "text"
        );
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.classList.add("alert");
        text.innerHTML = "⚠️";

        htmlElement.appendChild(text);

        htmlElement.style.position = "absolute";
        htmlElement.style.top = IS_WINDOWS ? "-.125ch" : "-.075ch";
        htmlElement.style.left = IS_WINDOWS ? ".35ch" : "0";
        htmlElement.style.transformOrigin = "50%";
        this.world!.appendChild(htmlElement);
      }

      htmlElement.style.display = "block";
      htmlElement.children[0].setAttribute("stroke-width", `${this.fontSize}`);
      (
        htmlElement.children[1] as SVGElement
      ).style.transform = `translate(90%, 50%) rotate(-${angle}deg)`;

      const circumference = width * 0.9 * Math.PI;
      htmlElement.children[0].setAttribute(
        "stroke-dasharray",
        `${(circumference * degrees) / 2} ${circumference * (1 - degrees)} ${
          (circumference * degrees) / 2
        } 0`
      );
      htmlElement.style.width = `${width}px`;
      htmlElement.style.height = `${height}px`;

      htmlElement.style.transform = `translate(${
        x * this.xStep - width / 2
      }px,${y * this.yStep - height / 2}px) rotate(${angle}deg)`;
    });

    for (let i = ranges.length; i < this.alertRanges.length; i++) {
      this.alertRanges[i].style.display = "none";
    }
  }

  unmount(): void {
    throw new Error("Method not implemented.");
  }

  getTime() {
    return this.time;
  }

  private canMove(deltaX: number, deltaY: number) {
    const revealEverything = DEBUG || Manager.Instance.getIsBaseDestroyed();
    if (revealEverything) {
      return true;
    }

    const bbox = this.getBBox();
    const constraints = Manager.Instance.getVisibilityController().getBBox();

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0 && bbox[0][0] <= constraints[0][0]) {
        return false;
      }

      if (deltaX > 0 && bbox[1][0] >= constraints[1][0]) {
        return false;
      }
    } else {
      if (deltaY < 0 && bbox[0][1] <= constraints[0][1]) {
        return false;
      }

      if (deltaY > 0 && bbox[1][1] >= constraints[1][1]) {
        return false;
      }
    }

    return true;
  }

  private registerEventHandlers(target: HTMLDivElement) {
    target.addEventListener("contextmenu", (event: Event) => {
      event.preventDefault();
      return false;
    });

    const preventMovement = (deltaX: number, deltaY: number, event: Event) => {
      const revealEverything = DEBUG || Manager.Instance.getIsBaseDestroyed();
      if (revealEverything) {
        return;
      }

      const bbox = this.getBBox();
      const constraints = Manager.Instance.getVisibilityController().getBBox();

      if (!this.canMove(deltaX, deltaY)) {
        event.preventDefault();
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
    if (x || y) {
      if (this.canMove(x, y)) {
        this.world!.scrollLeft += (x * this.fontSize) / 2;
        this.world!.scrollTop += (y * this.fontSize) / 2;
      }
    }

    if (zoom) {
      if (zoom < 0) {
        this.fontSize = Math.max(MIN_FONT_SIZE, this.fontSize * 0.9);
      } else {
        this.fontSize = Math.min(MAX_FONT_SIZE, this.fontSize * 1.1);
      }

      this.zoom();
      this.hasMoved = true;
    }
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
      case EntityType.Armory:
        return "🏰";
      case EntityType.Market:
        return "🏪";
      case EntityType.SpeedBeacon:
        return "⏰";
      case EntityType.DamageBeacon:
        return "🚨";
      case EntityType.Laser:
        return "🔭";
      default:
        return "❓";
    }
  }

  private getEmoji = (tile: Tile) => {
    const revealEverything = DEBUG || Manager.Instance.getIsBaseDestroyed();
    if (
      tile.getDiscoveryStatus() === DiscoveryStatus.Pending &&
      !revealEverything
    ) {
      return "🔍";
    }

    if (!tile.isDiscovered() && !revealEverything) {
      return "&nbsp;";
    }

    if (tile.hasStaticEntity()) {
      if (getScale(tile.getStaticEntity().getAgent()) !== 2) {
        return this.getStaticEntityEmoji(
          tile.getStaticEntity().getAgent().getType()
        );
      }
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
        return "&nbsp;";
    }
  };

  private getEntityEmoji(entity: Entity) {
    switch (entity.getAgent().getType()) {
      case EntityType.Slime:
        return "🐞";
      case EntityType.Bullet:
      case EntityType.Rocket:
        return "▪";
      case EntityType.Rail:
      case EntityType.LaserBeam:
        return "⬛";
      case EntityType.Flame:
        return "🔥";
      case EntityType.Shockwave:
        return "🌀";
      case EntityType.Runner:
        return "🪳";
      case EntityType.Flier:
        return "🐝";
      case EntityType.Tank:
        return "🦀";
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
