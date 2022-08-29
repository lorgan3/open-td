import Manager from "./manager";
import { Placeable } from "./placeables";
import Surface from "./terrain/surface";
import Tile from "./terrain/tile";

export enum Keys {
  Shift = "Shift",
  Control = "Control",
  Meta = "Meta",
  Plus = "+",
  Minus = "-",
  Equals = "=",
  Up = "ArrowUp",
  Left = "ArrowLeft",
  Right = "ArrowRight",
  Down = "ArrowDown",
  W = "w",
  A = "a",
  S = "s",
  D = "d",
  Z = "z",
  Q = "q",
}

const values = new Set<string>(Object.values(Keys));

function isKey(key: string): key is Keys {
  return values.has(key);
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

    if (this.pressedKeys[Keys.Control] || this.pressedKeys[Keys.Meta]) {
      let tiles: Tile[] = [];
      this.surface.forRect(this.mouseDownX, this.mouseDownY, x, y, (tile) => {
        if (tile.isDiscovered()) {
          tiles.push(tile);
        }
      });

      return tiles;
    }

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

    const tiles = this.getSelection();
    Manager.Instance.getBuildController().build(tiles, this.selectedPlacable);

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

  public isKeyDown(key: Keys) {
    return this.pressedKeys[key] ?? false;
  }
}

export default Controller;
