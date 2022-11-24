import { Container, Graphics, LINE_CAP, Loader, Sprite } from "pixi.js";
import { GameEvent } from "../../../data/events";
import EventSystem from "../../../data/eventSystem";
import SpawnAlert from "../../../data/util/spawnAlert";
import { ATLAS, AtlasTile } from "../atlas";
import { SCALE } from "../constants";
import { UI } from "../layer";

class AlertRenderer {
  static DISPLAY_DURATION = 10 * 1000;

  private container: Container;
  private alertSymbols: Sprite[] = [];
  private time = 0;
  private permanent = false;

  constructor(private loader: Loader) {
    this.container = new Container();
    UI.addChild(this.container);

    EventSystem.Instance.addEventListener(GameEvent.EndWave, () =>
      this.reset()
    );
  }

  enable() {
    this.permanent = true;
    this.container.alpha = 1;
    this.time = AlertRenderer.DISPLAY_DURATION;
  }

  disable() {
    this.permanent = false;
    this.time = AlertRenderer.DISPLAY_DURATION;
  }

  private reset() {
    this.time = 0;
    this.container.alpha = 1;
  }

  public render(center: [number, number], alerts: SpawnAlert[]) {
    this.alertSymbols = [];
    this.container.removeChildren();

    const [x, y] = center;
    const buffer = Math.PI / 128;

    alerts.forEach((alert) => {
      const [start, end] = alert.getRange();

      const alertContainer = new Container();
      const range = new Graphics();

      range.lineStyle({
        width: 10,
        color: 0xff00000,
        cap: LINE_CAP.ROUND,
        alpha: 0.8,
        alignment: 0.5,
      });
      range.arc(
        x * SCALE,
        y * SCALE,
        10 * SCALE,
        (start * Math.PI) / 180 + buffer,
        (end * Math.PI) / 180 - buffer
      );

      const symbol = new Sprite(
        this.loader.resources[ATLAS].textures![AtlasTile.Alert]
      );
      symbol.anchor.set(0.5);

      const direction = (alert.getCenter() * Math.PI) / 180;
      symbol.position.set(
        (x + Math.cos(direction) * 9.2) * SCALE,
        (y + Math.sin(direction) * 9.2) * SCALE
      );
      this.alertSymbols.push(symbol);

      alertContainer.addChild(range, symbol);
      this.container.addChild(alertContainer);
    });
  }

  update(dt: number, isStarted: boolean) {
    if (this.container.alpha <= 0) {
      return;
    }

    if (
      !this.permanent &&
      (this.time > AlertRenderer.DISPLAY_DURATION || isStarted)
    ) {
      this.container.alpha -= dt / 500;
    }

    this.alertSymbols.forEach((symbol) => {
      symbol.alpha = Math.abs(Math.cos(this.time / 300));
    });

    this.time += dt;
  }
}

export { AlertRenderer };
