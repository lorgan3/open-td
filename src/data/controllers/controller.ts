import { GameEvent } from "../events";
import Manager from "./manager";
import { Placeable } from "../placeables";
import Surface from "../terrain/surface";
import Tile from "../terrain/tile";
import EventSystem from "../eventSystem";

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
  B = "b",
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
  private _isMouseDown = false;
  private eventHandlers = new Map<Keys, Set<() => void>>();

  private selectedPlacable: Placeable | null = null;
  private buildMenuOpen = false;

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
    this._isMouseDown = true;
  }

  public mouseMove(x: number, y: number) {
    this.mouseX = x;
    this.mouseY = y;
  }

  public getSelection() {
    if (!this._isMouseDown) {
      return [];
    }

    let x = this.mouseX;
    let y = this.mouseY;

    if (this.pressedKeys[Keys.Control] || this.pressedKeys[Keys.Meta]) {
      let tiles: Tile[] = [];
      this.surface.forRect(
        this.mouseDownX,
        this.mouseDownY,
        x,
        y,
        (tile) => {
          if (tile.isDiscovered()) {
            tiles.push(tile);
          }
        },
        {
          scale: this.selectedPlacable?.entity?.scale || 1,
        }
      );

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
    this.surface.forLine(
      this.mouseDownX,
      this.mouseDownY,
      x,
      y,
      (tile) => {
        if (tile.isDiscovered()) {
          tiles.push(tile);
        }
      },
      {
        scale: this.selectedPlacable?.entity?.scale || 1,
      }
    );

    return tiles;
  }

  public mouseUp(x: number, y: number) {
    if (!this.selectedPlacable) {
      this._isMouseDown = false;
      return;
    }

    const tiles = this.getSelection();
    Manager.Instance.getBuildController().build(tiles, this.selectedPlacable);

    this._isMouseDown = false;
  }

  public keyDown(key: string) {
    if (isKey(key)) {
      this.pressedKeys[key as Keys] = true;
    }
  }

  public keyUp(key: string) {
    if (isKey(key)) {
      this.pressedKeys[key as Keys] = false;

      this.eventHandlers.get(key)?.forEach((fn) => fn());

      if (key === Keys.B) {
        this.toggleBuildMenu();
      }
    }
  }

  public toggleBuildMenu() {
    this.buildMenuOpen = !this.buildMenuOpen;
    if (this.buildMenuOpen) {
      EventSystem.Instance.triggerEvent(GameEvent.OpenBuildMenu);
    } else {
      EventSystem.Instance.triggerEvent(GameEvent.CloseBuildMenu);
    }
  }

  public isKeyDown(key: Keys) {
    return this.pressedKeys[key] ?? false;
  }

  public addKeyListener(key: Keys, fn: () => void) {
    if (this.eventHandlers.has(key)) {
      this.eventHandlers.get(key)!.add(fn);
    } else {
      this.eventHandlers.set(key, new Set([fn]));
    }

    return () => this.removeKeyListener(key, fn);
  }

  public removeKeyListener(key: Keys, fn: () => void) {
    this.eventHandlers.get(key)?.delete(fn);
  }

  isMouseDown() {
    return this._isMouseDown;
  }

  getMouse(scaleOverride?: number) {
    const scale = scaleOverride || this.selectedPlacable?.entity?.scale || 1;
    return [
      Math.floor(this.mouseX / scale) * scale,
      Math.floor(this.mouseY / scale) * scale,
    ];
  }
}

export default Controller;
