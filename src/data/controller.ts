import Manager from "./manager";
import placeables, { Placeable } from "./placeables";
import Surface from "./terrain/surface";
import Tile, { FREE_TILES, TileType } from "./terrain/tile";

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

    let tiles: Tile[] = [];
    this.surface.forLine(this.mouseDownX, this.mouseDownY, x, y, (tile) =>
      tiles.push(tile)
    );

    if (this.selectedPlacable.cost === 0) {
      tiles.forEach((tile) => {
        if (tile.hasStaticEntity()) {
          const entity = tile.getStaticEntity()!;
          const placeable = placeables.find(
            (placeable) => placeable.entityType === entity.getAgent().getType()
          );

          if (placeable) {
            Manager.Instance.addMoney(placeable?.cost);
            this.surface.despawnStatic(entity.getAgent());
          }
        }
      });
    } else {
      tiles = tiles.filter((tile) => FREE_TILES.has(tile.getType()));
      if (Manager.Instance.buy(this.selectedPlacable, tiles.length)) {
        tiles.forEach((tile) => {
          if (this.selectedPlacable?.entity) {
            this.surface.spawnStatic(new this.selectedPlacable.entity(tile));
          }
        });
      }
    }
  }
}

export default Controller;
