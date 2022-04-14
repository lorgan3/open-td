import { isPlaceableTile, Placeable } from "./placeables";
import Surface from "./terrain/surface";
import Tile, { TileType } from "./terrain/tile";

class Controller {
  private mouseDownX = 0;
  private mouseDownY = 0;

  private selectedPlacable: Placeable | null = null;

  constructor(private surface: Surface) {}

  public getPlacable() {
    return this.selectedPlacable;
  }

  public setPlaceable(placeable: Placeable) {
    this.selectedPlacable = placeable;
  }

  public mouseDown(x: number, y: number) {
    this.mouseDownX = x;
    this.mouseDownY = y;
  }

  public mouseUp(x: number, y: number, shiftKey: boolean) {
    if (!this.selectedPlacable) {
      return;
    }

    if (shiftKey) {
      if (x > y) {
        y = this.mouseDownY;
      } else {
        x = this.mouseDownX;
      }
    }

    this.surface.forLine(this.mouseDownX, this.mouseDownY, x, y, (tile) => {
      if (isPlaceableTile(this.selectedPlacable!)) {
        this.surface.setTile(new Tile(tile.getX(), tile.getY(), TileType.Wall));
      } else {
        this.surface.spawnStatic(new this.selectedPlacable!.entity(tile));
      }
    });
  }
}

export default Controller;
