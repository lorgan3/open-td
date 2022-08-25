import { EntityType } from "./entity/entity";
import { GameEvent } from "./events";
import Manager from "./manager";
import { TOWER_PRICES } from "./moneyController";
import placeables, { Placeable } from "./placeables";
import Surface from "./terrain/surface";
import Tile, { FREE_TILES } from "./terrain/tile";

enum Keys {
  Shift = "Shift",
}

function isKey(key: string): key is Keys {
  return key in Keys;
}

class Controller {
  private mouseDownX = 0;
  private mouseDownY = 0;
  private mouseX = 0;
  private mouseY = 0;
  private pressedKeys: Partial<Record<Keys, boolean>> = {};
  private isMouseDown = false;

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
    this.isMouseDown = true;
  }

  public mouseMove(x: number, y: number) {
    this.mouseX = x;
    this.mouseY = y;
  }

  public getSelection() {
    if (!this.isMouseDown) {
      return [];
    }

    let x = this.mouseX;
    let y = this.mouseY;

    if (this.pressedKeys[Keys.Shift]) {
      if (Math.abs(x - this.mouseDownX) > Math.abs(y - this.mouseDownY)) {
        y = this.mouseDownY;
      } else {
        x = this.mouseDownX;
      }
    }

    let tiles: Tile[] = [];
    this.surface.forLine(this.mouseDownX, this.mouseDownY, x, y, (tile) => {
      if (tile.isDiscovered()) {
        tiles.push(tile);
      }
    });

    return tiles;
  }

  public mouseUp(x: number, y: number) {
    if (!this.selectedPlacable) {
      this.isMouseDown = false;
      return;
    }

    let tiles = this.getSelection();

    if (this.selectedPlacable.entityType === EntityType.None) {
      tiles.forEach((tile) => {
        if (tile.hasStaticEntity()) {
          const entity = tile.getStaticEntity()!;
          const placeable = placeables.find(
            (placeable) => placeable.entityType === entity.getAgent().getType()
          );

          if (placeable) {
            Manager.Instance.addMoney(TOWER_PRICES[placeable.entityType] ?? 0);
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

    Manager.Instance.triggerEvent(GameEvent.SurfaceChange, {
      affectedTiles: tiles,
    });
    this.isMouseDown = false;
  }

  public keyDown(key: string) {
    if (isKey(key)) {
      this.pressedKeys[key as Keys] = true;
    }
  }

  public keyUp(key: string) {
    if (isKey(key)) {
      this.pressedKeys[key as Keys] = false;
    }
  }
}

export default Controller;
