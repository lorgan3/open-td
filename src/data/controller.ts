import Tower from "./entity/tower";
import Surface from "./terrain/surface";
import Tile, { TileType } from "./terrain/tile";

class Controller {
  private mouseDownX = 0;
  private mouseDownY = 0;

  constructor(private surface: Surface) {}

  public mouseDown(x: number, y: number) {
    this.mouseDownX = x;
    this.mouseDownY = y;
  }

  public mouseUp(x: number, y: number, shiftKey: boolean) {
    if (shiftKey) {
      if (x > y) {
        y = this.mouseDownY;
      } else {
        x = this.mouseDownX;
      }
    }

    this.surface.forLine(this.mouseDownX, this.mouseDownY, x, y, (tile) => {
      this.surface.setTile(new Tile(tile.getX(), tile.getY(), TileType.Wall));
    });
  }
}

export default Controller;
