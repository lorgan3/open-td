import { Graphics } from "pixi.js";
import Controller, { Mode } from "../../../data/controllers/controller";

import { SCALE } from "../constants";
import { UI } from "../layer";

class CursorRenderer {
  private container: Graphics;

  private oldMousePosition = "";
  private oldMode = Mode.Line;

  constructor() {
    this.container = new Graphics();
    UI.addChild(this.container);
  }

  public render() {
    const controller = Controller.Instance;

    const mousePosition = controller.getMouse();
    const mode = controller.getMode();
    if (
      mousePosition.join(",") === this.oldMousePosition &&
      mode === this.oldMode
    ) {
      return;
    }

    this.oldMousePosition = mousePosition.join(",");
    this.oldMode = mode;
    const scale = SCALE * (controller.getPlacable()?.entity?.scale || 1);

    this.container!.clear();
    this.container!.lineStyle(2, 0x000000);
    if (controller.isMouseDown()) {
      controller.getSelection().forEach((tile) => {
        this.container!.drawRect(
          tile.getX() * SCALE,
          tile.getY() * SCALE,
          scale,
          scale
        );
      });
    } else {
      const [x, y] = controller.getMouse();
      this.container!.drawRect(x * SCALE, y * SCALE, scale, scale);
    }
  }
}

export { CursorRenderer };
