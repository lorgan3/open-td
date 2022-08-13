import Controller from "../../data/controller";
import Entity, { EntityType } from "../../data/entity/entity";
import Pool, { PoolType } from "../../data/pool";
import Surface from "../../data/terrain/surface";
import Tile, { TileType } from "../../data/terrain/tile";
import { IRenderer } from "../api";
import { OVERRIDES } from "./overrides";

class Renderer implements IRenderer {
  private pool: Pool<Entity, HTMLSpanElement>;
  public xStep = 0;
  public yStep = 0;
  private offsetX = 0;
  private offsetY = 0;

  private target: HTMLDivElement | null = null;
  private rows: HTMLDivElement[] = [];

  constructor(private surface: Surface, private controller: Controller) {
    this.pool = new Pool(
      (active, original, entity) => {
        if (original) {
          original.style.display = "block";
          original.textContent = this.getEntityEmoji(entity!);
          return original;
        }

        const htmlElement = document.createElement("span");
        htmlElement.textContent = entity ? this.getEntityEmoji(entity!) : "";
        htmlElement.style.position = "absolute";
        htmlElement.style.top = "0";
        htmlElement.style.left = "0";
        htmlElement.style.display = active ? "block" : "none";
        htmlElement.style.willChange = "transform";
        this.target!.appendChild(htmlElement);

        return htmlElement;
      },
      PoolType.Growing,
      0
    );
  }

  mount(target: HTMLDivElement): void {
    this.target = target;

    target.style.lineHeight = "1em";
    target.style.whiteSpace = "nowrap";
    target.style.display = "inline-flex";
    target.style.flexDirection = "column";
    target.style.cursor = "crosshair";
    target.style.userSelect = "none";

    this.renderTiles();

    const { width, height, x, y } = target.getBoundingClientRect();
    this.xStep = width / this.surface.getWidth();
    this.yStep = height / this.surface.getHeight();
    this.offsetX = x;
    this.offsetY = y;

    this.rerender();

    this.registerEventHandlers(target);
  }

  rerender(): void {
    if (this.surface.isDirty()) {
      this.renderTiles();
    }

    const entities = this.surface.getEntities();
    for (let entity of entities) {
      if (!this.getEntityEmoji(entity)) {
        continue;
      }

      const htmlElement = this.pool.get(entity);
      htmlElement.style.opacity = "1";
      htmlElement.style.transformOrigin = "50% 50%";

      const fn = OVERRIDES[entity.getAgent().getType()];
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

    this.surface.markPristine();
  }

  private renderTiles() {
    this.surface.markPristine();
    const rows = this.surface.getHeight();
    for (let i = 0; i < rows; i++) {
      let row = this.rows[i];
      if (!row) {
        row = document.createElement("div");
        this.rows[i] = row;
        this.target!.appendChild(row);
      }

      const content = this.surface.getRow(i).map(this.getEmoji).join("");
      row.textContent = content;
    }
  }

  unmount(): void {
    throw new Error("Method not implemented.");
  }

  private registerEventHandlers(target: HTMLDivElement) {
    target.addEventListener("contextmenu", (event: Event) => {
      event.preventDefault();
      return false;
    });

    target.addEventListener("mousedown", (event: MouseEvent) => {
      const x = Math.floor((event.pageX - this.offsetX) / this.xStep);
      const y = Math.floor((event.pageY - this.offsetY) / this.yStep);

      this.controller.mouseDown(x, y);
    });

    target.addEventListener("mouseup", (event: MouseEvent) => {
      const x = Math.floor((event.pageX - this.offsetX) / this.xStep);
      const y = Math.floor((event.pageY - this.offsetY) / this.yStep);

      this.controller.mouseUp(x, y, event.shiftKey);
    });
  }

  private getEmoji(tile: Tile) {
    if (tile.hasStaticEntity()) {
      switch (tile.getStaticEntity()!.getAgent().getType()) {
        case EntityType.Tower:
          return "🗼";
        case EntityType.Wall:
          return "🚧";
        case EntityType.Mortar:
          return "🛰";
        case EntityType.Flamethrower:
          return "🧯";
        case EntityType.Railgun:
          return "🌡";
        case EntityType.ElectricFence:
          return "⚡";
        case EntityType.Fence:
          return "🥅";
        case EntityType.Freezer:
          return "❄️";
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
      default:
        return "🌌";
    }
  }

  private getEntityEmoji(entity: Entity) {
    switch (entity.getAgent().getType()) {
      case EntityType.Slime:
        return "🪲";
      case EntityType.Base:
        return "⛺";
      case EntityType.Bullet:
        return "▪";
      case EntityType.Rail:
        return "〰";
      case EntityType.Flame:
        return "🔥";
      default:
        return "";
    }
  }
}
export default Renderer;
