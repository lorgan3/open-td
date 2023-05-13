import { Graphics } from "pixi.js";
import { UI } from "../layer";
import { IEnemy } from "../../../data/entity/enemies";

export class HealthBar extends Graphics {
  constructor(private enemy: IEnemy) {
    super();

    this.fill.alpha = 0.6;
    this.fill.visible = true;

    UI.addChild(this);
  }

  update(x: number, y: number) {
    const scale = this.enemy.getScale();

    this.fill.color = 0x000000;
    this.drawRect(0, 0, 32 * scale, 6 * scale);
    this.fill.color = 0xff0000;
    this.drawRect(
      1,
      1,
      (32 * scale - 2) * this.enemy.AI.getHpPercent(),
      6 * scale - 2
    );

    this.position.set(x - 16 * scale, y - 16 * scale);
  }

  remove() {
    UI.removeChild(this);
  }
}
