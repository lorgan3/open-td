import Controller from "../../data/controller";
import Entity, { EntityType } from "../../data/entity/entity";
import Surface from "../../data/terrain/surface";
import Tile, { TileType } from "../../data/terrain/tile";
import { IRenderer } from "../api";

class Renderer implements IRenderer {
  private entityHtmlElements: Record<number, HTMLSpanElement> = {};
  private xStep: number = 0;
  private yStep: number = 0;

  private target: HTMLDivElement | null = null;
  private rows: HTMLDivElement[] = [];

  constructor(
    private surface: Surface,
    private controller: Controller = new Controller(surface)
  ) {}

  mount(target: HTMLDivElement): void {
    this.target = target;

    target.style.lineHeight = "1em";
    target.style.whiteSpace = "nowrap";
    target.style.display = "inline-flex";
    target.style.flexDirection = "column";
    target.style.cursor = "crosshair";

    this.renderTiles();

    const { width, height } = target.getBoundingClientRect();
    this.xStep = width / this.surface.getWidth();
    this.yStep = height / this.surface.getHeight();

    this.rerender();

    this.registerEventHandlers(target);
  }

  rerender(): void {
    if (this.surface.isDirty()) {
      this.renderTiles();
    }

    const entities = this.surface.getEntities();
    for (let entity of entities) {
      const htmlElement = this.getHtmlElement(entity);
      htmlElement.style.transform = `translate(${
        entity.getX() * this.xStep
      }px, ${entity.getY() * this.yStep}px)`;
    }
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

  private getHtmlElement(entity: Entity) {
    let htmlElement = this.entityHtmlElements[entity.getId()];

    if (!htmlElement) {
      htmlElement = document.createElement("span");
      htmlElement.textContent = "🪲";
      htmlElement.style.position = "absolute";
      htmlElement.style.top = "0";
      htmlElement.style.left = "0";

      this.entityHtmlElements[entity.getId()] = htmlElement;
      this.target!.appendChild(htmlElement);
    }

    return htmlElement;
  }

  unmount(): void {
    throw new Error("Method not implemented.");
  }

  private registerEventHandlers(target: HTMLDivElement) {
    target.addEventListener("click", (event: MouseEvent) => {
      const x = Math.floor(event.pageX / this.xStep);
      const y = Math.floor(event.pageY / this.yStep);

      this.controller.click(x, y);
    });
  }

  private getEmoji(tile: Tile) {
    if (tile.hasStaticEntity()) {
      switch (tile.getStaticEntity()!.getAgent().getType()) {
        case EntityType.Tower:
          return "🗼";
      }
    }

    switch (tile.getBaseType()) {
      case TileType.Water:
        return "🟦";
      case TileType.Stone:
        return "⬜";
      case TileType.Grass:
        return "🟩";
      default:
        return "🌌";
    }
  }
}
export default Renderer;
