import { Viewport } from "pixi-viewport";
import { Loader, ParticleContainer, Sprite, Texture } from "pixi.js";
import { Difficulty } from "../../../data/difficulty";
import Manager from "../../../data/manager";
import Path from "../../../data/terrain/path/path";
import Surface from "../../../data/terrain/surface";
import Tile from "../../../data/terrain/tile";
import { ATLAS, AtlasTile } from "../atlas";
import { SCALE } from "../renderer";

class Marker extends Sprite {
  constructor(private offset: number, private path: Path, texture: Texture) {
    super(texture);

    const { x, y } = this.path.getCoordinates(
      this.offset % this.path.getLength()
    );
    this.position.set(x * SCALE, y * SCALE);
  }

  move() {
    this.offset += 0.1;
    const { x, y } = this.path.getCoordinates(
      this.offset % this.path.getLength()
    );
    this.position.set(x * SCALE, y * SCALE);
  }
}

class CoverageRenderer {
  private coverageContainer: ParticleContainer;
  private pathContainer: ParticleContainer;

  private towers = new Map<string, Sprite[]>();
  private hoveredTile?: Tile;
  private visible = false;

  constructor(
    private loader: Loader,
    private viewport: Viewport,
    private surface: Surface
  ) {
    this.coverageContainer = new ParticleContainer(
      undefined,
      {
        uvs: true,
      },
      undefined,
      true
    );
    this.viewport.addChild(this.coverageContainer);

    this.pathContainer = new ParticleContainer(
      undefined,
      {
        position: true,
      },
      undefined,
      true
    );
    this.viewport.addChild(this.pathContainer);
  }

  public show() {
    this.visible = true;
    this.render();
  }

  public hide() {
    this.visible = false;

    this.coverageContainer.removeChildren();
    this.pathContainer.removeChildren();
  }

  public render() {
    if (!this.visible) {
      return;
    }

    this.renderCoverage();

    if (Manager.Instance.getDifficulty() === Difficulty.Easy) {
      this.renderPaths();
    }
  }

  private renderCoverage() {
    this.coverageContainer.removeChildren();
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
        this.coverageContainer.addChild(sprite);

        tileTowers.forEach((tower) => {
          const sprites = this.towers.get(tower.getTile().getHash()) || [];
          sprites.push(sprite);
          this.towers.set(tower.getTile().getHash(), sprites);
        });
      });
    }
  }

  private renderPaths() {
    this.pathContainer.removeChildren();
    const paths: Path[] = [];

    Manager.Instance.getSpawnGroups().forEach((spawnGroup) =>
      spawnGroup.getSpawnPoints().forEach((path) => paths.push(path))
    );

    if (!Manager.Instance.getIsStarted()) {
      const nextSpawnGroup = Manager.Instance.getNextSpawnGroup();
      if (nextSpawnGroup) {
        paths.push(...nextSpawnGroup.getSpawnPoints());
      }
    }

    paths.forEach((path, index) => {
      const markers = Math.max(1, Math.floor(path.getLength() / 5));
      for (let i = 0; i < markers; i++) {
        this.pathContainer.addChild(
          new Marker(
            index * 2 + i * 5,
            path,
            this.loader.resources[ATLAS].textures![AtlasTile.Entity]
          )
        );
      }
    });
  }

  public update() {
    if (!this.visible) {
      return;
    }

    if (Manager.Instance.getIsStarted()) {
      this.pathContainer.removeChildren();
    } else {
      (this.pathContainer.children as Marker[]).forEach((marker) =>
        marker.move()
      );
    }

    const [x, y] = Manager.Instance.getController().getMouse(2);
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
