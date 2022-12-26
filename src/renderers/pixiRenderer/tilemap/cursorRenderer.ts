import { Graphics } from "pixi.js";
import Controller, { Mode } from "../../../data/controllers/controller";
import Manager from "../../../data/controllers/manager";
import { ITowerStatics } from "../../../data/entity/towers";
import Tile from "../../../data/terrain/tile";

import { SCALE } from "../constants";
import { UI } from "../layer";
import { OutlineFilter } from "../shaders/outlineFilter";

class CursorRenderer {
  private container: Graphics;
  private rangeGraphic: Graphics;

  private oldMousePosition = "";
  private oldMode = Mode.Line;

  constructor() {
    this.rangeGraphic = new Graphics();
    this.rangeGraphic.filters = [new OutlineFilter(2, 0x000000)];

    this.container = new Graphics();
    this.container.filters = [new OutlineFilter(2, 0x000000)];

    UI.addChild(this.rangeGraphic, this.container);
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

    const placeable = controller.getPlacable();
    const scale = SCALE * (placeable?.entity?.scale || 1);

    this.rangeGraphic.clear();
    this.container.clear();
    this.container.fill.visible = true; // 🤷

    const tiles = new Set<Tile>();
    const surface = Manager.Instance.getSurface();
    let range: number | undefined = undefined;
    if (placeable?.entity) {
      const statics = placeable.entity as unknown as ITowerStatics;
      range = statics.range;
    }

    if (controller.isMouseDown()) {
      controller.getSelection().forEach((tile) => {
        this.container.drawRect(
          tile.getX() * SCALE,
          tile.getY() * SCALE,
          scale,
          scale
        );

        if (range) {
          surface.forCircle(tile.getX() + 1, tile.getY() + 1, range, (tile) =>
            tiles.add(tile)
          );
        }
      });
    } else {
      const [x, y] = controller.getMouse();
      this.container.drawRect(x * SCALE, y * SCALE, scale, scale);

      if (range) {
        surface.forCircle(x + 1, y + 1, range, (tile) => tiles.add(tile));
      }
    }

    // Draw the range of all towers that will potentially be built.
    this.rangeGraphic.clear().beginFill();
    for (let tile of tiles) {
      this.rangeGraphic.drawRect(
        tile.getX() * SCALE,
        tile.getY() * SCALE,
        SCALE,
        SCALE
      );
    }
    this.rangeGraphic.endFill();

    this.container.drawt;
  }
}

export { CursorRenderer };
