import Surface from "../../data/terrain/surface";
import Tile, { TileType } from "../../data/terrain/tile";
import { IRenderer } from "../api";

class Renderer implements IRenderer {
  render(target: HTMLDivElement, surface: Surface): void {
    target.style.lineHeight = "1em";
    target.style.whiteSpace = "nowrap";

    const rows = surface.getHeight();
    for (let i = 0; i < rows; i++) {
      const content = surface.getRow(i).map(this.getEmoji).join("");

      const row = document.createElement("div");
      row.textContent = content;
      target.appendChild(row);
    }
  }

  getEmoji(tile: Tile) {
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
