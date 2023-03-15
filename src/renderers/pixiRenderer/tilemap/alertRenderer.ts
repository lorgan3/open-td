import { Container, Graphics, LINE_CAP, Sprite } from "pixi.js";
import { EntityType } from "../../../data/entity/constants";
import { GameEvent } from "../../../data/events";
import EventSystem from "../../../data/eventSystem";
import SpawnAlert from "../../../data/util/spawnAlert";
import { AssetsContainer } from "../assets/container";
import { ATLAS, AtlasTile } from "../atlas";
import { SCALE } from "../constants";
import { UI } from "../layer";

class AlertRenderer {
  static displayDuration = 20 * 1000;
  static enemySpriteMap: Map<EntityType, string> = new Map([
    [EntityType.Runner, AtlasTile.Runner],
    [EntityType.Slime, AtlasTile.Regular],
    [EntityType.Tank, AtlasTile.Tank],
    [EntityType.Flier, AtlasTile.Flier],
    [EntityType.Behemoth, AtlasTile.Runner],
    [EntityType.Bore, AtlasTile.Tank],
  ]);

  private container: Container;
  private alertSymbols: Sprite[] = [];
  private time = 0;
  private permanent = false;

  constructor(private assetsContainer: AssetsContainer) {
    this.container = new Container();
    UI.addChild(this.container);

    EventSystem.Instance.addEventListener(GameEvent.EndWave, () =>
      this.reset()
    );
  }

  enable() {
    this.permanent = true;
    this.container.alpha = 1;
    this.time = AlertRenderer.displayDuration;
  }

  disable() {
    this.permanent = false;
    this.time = AlertRenderer.displayDuration;
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
        this.assetsContainer.assets![ATLAS].textures![AtlasTile.Alert]
      );
      symbol.anchor.set(0.5);
      symbol.scale.set(2);
      this.alertSymbols.push(symbol);

      const container = new Container();
      const center = alert.getCenter();
      const direction = (center * Math.PI) / 180;
      container.position.set(
        (x + Math.cos(direction) * 9.2) * SCALE,
        (y + Math.sin(direction) * 9.2) * SCALE
      );
      container.addChild(symbol);

      alert.getUnits().forEach((unit, i) => {
        const icon = new Sprite(
          this.assetsContainer.assets![ATLAS].textures![
            AlertRenderer.enemySpriteMap.get(unit)!
          ]
        );
        const direction = center > 270 || center < 90 ? -1 : 1;
        const offset = direction > 0 ? 16 : -48;
        icon.position.set(offset + 32 * i * direction, 8);
        container.addChild(icon);
      });

      alertContainer.addChild(range, container);
      this.container.addChild(alertContainer);
    });
  }

  update(dt: number, isStarted: boolean) {
    if (this.container.alpha <= 0) {
      return;
    }

    if (
      !this.permanent &&
      (this.time > AlertRenderer.displayDuration || isStarted)
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
