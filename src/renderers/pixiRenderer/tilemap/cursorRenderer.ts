import { Graphics, Text } from "pixi.js";
import Controller, { Mode } from "../../../data/controllers/controller";
import Manager from "../../../data/controllers/manager";
import MoneyController from "../../../data/controllers/moneyController";
import { EntityType } from "../../../data/entity/constants";
import { Agent } from "../../../data/entity/entity";
import { ITowerStatics } from "../../../data/entity/towers";
import { Placeable } from "../../../data/placeables";
import Tile from "../../../data/terrain/tile";

import { SCALE } from "../constants";
import { UI } from "../layer";
import { OutlineFilter } from "../shaders/outlineFilter";

const FORMATTER = Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

class CursorRenderer {
  private container: Graphics;
  private rangeGraphic: Graphics;
  private text: Text;

  private oldMousePosition = "";
  private oldMode = Mode.Line;
  private oldPlaceable: Placeable | null = null;

  constructor() {
    this.rangeGraphic = new Graphics();
    this.rangeGraphic.filters = [new OutlineFilter(2, 0x000000, 0)];

    this.container = new Graphics();
    this.container.filters = [new OutlineFilter(2, 0x000000, 0)];

    this.text = new Text("", {
      fontFamily: "JupiterCrash",
      fontSize: 24,
      fill: 0x000000,
      align: "left",
      dropShadow: true,
      dropShadowColor: 0xffffff,
      dropShadowDistance: 2,
    });

    UI.addChild(this.rangeGraphic, this.container, this.text);
  }

  public render() {
    const controller = Controller.Instance;

    const mousePosition = controller.getMouse();
    const mode = controller.getMode();
    const placeable = controller.getPlacable();
    if (
      mousePosition.join(",") === this.oldMousePosition &&
      mode === this.oldMode &&
      placeable === this.oldPlaceable
    ) {
      return;
    }

    this.oldMousePosition = mousePosition.join(",");
    this.oldMode = mode;
    this.oldPlaceable = placeable;

    const scale = SCALE * (placeable?.entity?.scale || 1);

    this.rangeGraphic.clear();
    this.container.clear();
    this.container.fill.visible = true; // 🤷

    const agents = new Set<Agent>();
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

        if (tile.hasStaticEntity()) {
          agents.add(tile.getStaticEntity().getAgent());
        }
      });
    } else {
      const [x, y] = controller.getMouse();
      this.container.drawRect(x * SCALE, y * SCALE, scale, scale);

      if (range) {
        surface.forCircle(x + 1, y + 1, range, (tile) => tiles.add(tile));
      }

      const tile = surface.getTile(x, y);
      if (tile && tile.hasStaticEntity()) {
        agents.add(tile.getStaticEntity().getAgent());
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

    if (placeable?.entityType === EntityType.None) {
      const amount = [...agents].reduce(
        (sum, agent) => sum + MoneyController.Instance.getValue(agent),
        0
      );

      if (amount > 0) {
        this.text.text = `Sell for 🪙 ${FORMATTER.format(amount)}`;
      } else {
        this.text.text = "";
      }

      this.text.position.set(
        mousePosition[0] * SCALE,
        mousePosition[1] * SCALE - 24
      );
    } else {
      this.text.text = "";
    }
  }
}

export { CursorRenderer };
