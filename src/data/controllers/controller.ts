import { GameEvent } from "../events";
import { DEMOLISH, Placeable, TOWER } from "../placeables";
import Surface from "../terrain/surface";
import Tile from "../terrain/tile";
import EventSystem from "../eventSystem";
import BuildController from "./buildController";

export enum Key {
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
  Escape = "Escape",
  W = "w",
  A = "a",
  S = "s",
  D = "d",
  Z = "z",
  Q = "q",
  B = "b",
  E = "e",
  F = "f",
}

export enum Mode {
  Single = "single",
  Line = "line",
  StraightLine = "straightLine",
  grid = "grid",
}

const values = new Set<string>(Object.values(Key));

function isKey(key: string): key is Key {
  return values.has(key);
}

class Controller {
  private static instance: Controller;

  private mouseDownX = 0;
  private mouseDownY = 0;
  private mouseX = 0;
  private mouseY = 0;
  private pressedKeys: Partial<Record<Key, boolean>> = {};
  private _isMouseDown = false;
  private eventHandlers = new Map<Key, Set<() => void>>();

  private selectedPlacable: Placeable = DEMOLISH;
  private previousSelectedPlacable: Placeable = TOWER;
  private buildMenuOpen = false;
  private isPaused = false;

  constructor(private surface: Surface) {
    Controller.instance = this;
  }

  public getPlacable() {
    return this.selectedPlacable;
  }

  public setPlaceable(placeable: Placeable) {
    this.selectedPlacable = placeable;
    EventSystem.Instance.triggerEvent(GameEvent.SelectPlaceable, { placeable });
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

    if (this.pressedKeys[Key.Control] || this.pressedKeys[Key.Meta]) {
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

    if (this.pressedKeys[Key.Shift]) {
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
    BuildController.Instance.build(tiles, this.selectedPlacable);

    this._isMouseDown = false;
  }

  public keyDown(key: string) {
    if (isKey(key)) {
      this.pressedKeys[key as Key] = true;
    }
  }

  public keyUp(key: string) {
    if (isKey(key)) {
      this.pressedKeys[key as Key] = false;

      if (this.isPaused && key !== Key.Escape) {
        return;
      }

      this.eventHandlers.get(key)?.forEach((fn) => fn());

      if (key === Key.B || key === Key.E) {
        this.toggleBuildMenu();
      }

      // @TODO: I would like to use `Q` for this but there's no easy way to figure out azerty/qwerty keyboards
      if (key === Key.F) {
        if (this.selectedPlacable !== DEMOLISH) {
          this.previousSelectedPlacable = this.selectedPlacable;
          this.setPlaceable(DEMOLISH);
        } else {
          const temp = this.previousSelectedPlacable;
          this.previousSelectedPlacable = this.selectedPlacable;
          this.setPlaceable(temp);
        }
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

  public isKeyDown(key: Key) {
    return this.pressedKeys[key] ?? false;
  }

  public addKeyListener(key: Key, fn: () => void) {
    if (this.eventHandlers.has(key)) {
      this.eventHandlers.get(key)!.add(fn);
    } else {
      this.eventHandlers.set(key, new Set([fn]));
    }

    return () => this.removeKeyListener(key, fn);
  }

  public removeKeyListener(key: Key, fn: () => void) {
    this.eventHandlers.get(key)?.delete(fn);
  }

  isMouseDown() {
    return this._isMouseDown;
  }

  getMouse(scaleOverride?: number): [number, number] {
    const scale = scaleOverride || this.selectedPlacable?.entity?.scale || 1;
    return [
      Math.floor(this.mouseX / scale) * scale,
      Math.floor(this.mouseY / scale) * scale,
    ];
  }

  getMode() {
    if (!this._isMouseDown) {
      return Mode.Single;
    }

    if (this.pressedKeys[Key.Control] || this.pressedKeys[Key.Meta]) {
      return Mode.grid;
    }

    if (this.pressedKeys[Key.Shift]) {
      return Mode.StraightLine;
    }

    return Mode.Line;
  }

  pause() {
    this.isPaused = true;
  }

  unpause() {
    this.isPaused = false;
  }

  static get Instance() {
    return this.instance;
  }
}

export default Controller;
