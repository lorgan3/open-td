import Controller from "../../data/controller";
import Surface from "../../data/terrain/surface";
import Tile, { TileType } from "../../data/terrain/tile";
import { IRenderer } from "../api";

class Renderer implements IRenderer {
  constructor(
    private surface: Surface,
    private controller: Controller = new Controller(surface)
  ) {}

  render(target: HTMLDivElement): void {
    target.style.lineHeight = "1em";
    target.style.whiteSpace = "nowrap";
    target.style.display = "inline-flex";
    target.style.flexDirection = "column";
    target.style.cursor = "crosshair";

    const rows = this.surface.getHeight();
    for (let i = 0; i < rows; i++) {
      const content = this.surface.getRow(i).map(this.getEmoji).join("");

      const row = document.createElement("div");
      row.textContent = content;
      target.appendChild(row);
    }

    this.registerEventHandlers(target);
  }

  private registerEventHandlers(target: HTMLDivElement) {
    const { width, height } = target.getBoundingClientRect();
    const xStep = width / this.surface.getWidth();
    const yStep = height / this.surface.getHeight();

    target.addEventListener("click", (event: MouseEvent) => {
      const x = Math.floor(event.pageX / xStep);
      const y = Math.floor(event.pageY / yStep);

      this.controller.click(x, y);
    });
  }

  private getEmoji(tile: Tile) {
    switch (tile.getType()) {
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
