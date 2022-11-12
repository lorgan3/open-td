import { Viewport } from "pixi-viewport";
import { Loader, ParticleContainer, Sprite } from "pixi.js";
import Manager from "../../../data/manager";
import Surface from "../../../data/terrain/surface";
import Tile from "../../../data/terrain/tile";
import { ATLAS, AtlasTile } from "../atlas";
import { SCALE } from "../renderer";

class CoverageRenderer {
  private container: ParticleContainer;
  private towers = new Map<string, Sprite[]>();

  private hoveredTile?: Tile;

  constructor(
    private loader: Loader,
    private viewport: Viewport,
    private surface: Surface
  ) {
    this.container = new ParticleContainer(
      undefined,
      {
        uvs: true,
      },
      undefined,
      true
    );
    this.viewport.addChild(this.container);
  }

  public render() {
    this.container.removeChildren();
    this.towers.clear();
    this.hoveredTile = undefined;

    const rows = this.surface.getHeight();
    for (let i = 0; i < rows; i++) {
      this.surface.getRow(i).forEach((tile) => {
        const tileTowers = tile.getTowers();

        if (tileTowers.length === 0 || !tile.isDiscovered()) {
          return;
        }

        const sprite = new Sprite(
          this.loader.resources[ATLAS].textures![AtlasTile.Coverage]
        );
        sprite.alpha = Math.min(0.1 + 0.2 * tileTowers.length, 0.8);
        sprite.position.set(tile.getX() * SCALE, tile.getY() * SCALE);
        this.container.addChild(sprite);

        tileTowers.forEach((tower) => {
          const sprites = this.towers.get(tower.getTile().getHash()) || [];
          sprites.push(sprite);
          this.towers.set(tower.getTile().getHash(), sprites);
        });
      });
    }
  }

  public update() {
    const [x, y] = Manager.Instance.getController().getMouse();
    const newHoveredTile = this.surface.getTile(x, y);

    if (newHoveredTile === this.hoveredTile) {
      return;
    }

    if (this.hoveredTile) {
      this.towers.get(this.hoveredTile.getHash())?.forEach((sprite) => {
        sprite.texture =
          this.loader.resources[ATLAS].textures![AtlasTile.Coverage];
      });
    }

    if (newHoveredTile) {
      this.towers.get(newHoveredTile.getHash())?.forEach((sprite) => {
        sprite.texture =
          this.loader.resources[ATLAS].textures![AtlasTile.ActiveCoverage];
      });
    }

    this.hoveredTile = newHoveredTile;
  }
}

export { CoverageRenderer };
