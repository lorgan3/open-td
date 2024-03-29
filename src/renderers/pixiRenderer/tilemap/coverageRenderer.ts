import { ParticleContainer, Sprite, Texture } from "pixi.js";
import { Difficulty } from "../../../data/difficulty";
import Manager from "../../../data/controllers/manager";
import Path from "../../../data/terrain/path/path";
import Surface from "../../../data/terrain/surface";
import Tile from "../../../data/terrain/tile";
import { ATLAS, AtlasTile } from "../atlas";
import { SCALE } from "../constants";
import { BASE_ENTITIES } from "../../../data/entity/constants";
import { FLOOR, UI } from "../layer";
import WaveController from "../../../data/controllers/waveController";
import Controller from "../../../data/controllers/controller";
import { AssetsContainer } from "../assets/container";

class Marker extends Sprite {
  constructor(private offset: number, private path: Path, texture: Texture) {
    super(texture);

    const { x, y } = this.path.getCoordinates(
      this.offset % this.path.getLength()
    );
    this.position.set(x * SCALE, y * SCALE);
  }

  move(dt: number) {
    this.offset += dt / 100 / this.path.getScale();
    const { x, y } = this.path.getCoordinates(
      this.offset % this.path.getLength()
    );
    this.position.set(x * SCALE, y * SCALE);
  }
}

class Coverage extends Sprite {
  public originalAlpha = 1;
}

class CoverageRenderer {
  private coverageContainer: ParticleContainer;
  private pathContainer: ParticleContainer;

  private towers = new Map<string, Coverage[]>();
  private hoveredTile?: Tile;
  private visible = false;

  constructor(private container: AssetsContainer, private surface: Surface) {
    this.coverageContainer = new ParticleContainer(
      undefined,
      {
        uvs: true,
        alpha: true,
      },
      undefined,
      true
    );
    FLOOR.addChild(this.coverageContainer);

    this.pathContainer = new ParticleContainer(
      undefined,
      {
        position: true,
      },
      undefined,
      true
    );
    UI.addChild(this.pathContainer);
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

    if (
      (Manager.Instance.getDifficulty() === Difficulty.Easy ||
        Manager.Instance.getDifficulty() === Difficulty.Practice) &&
      !Manager.Instance.getIsStarted()
    ) {
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

        const sprite = new Coverage(
          this.container.assets![ATLAS].textures![AtlasTile.Coverage]
        );
        sprite.originalAlpha = Math.min(0.15 + 0.1 * tileTowers.length, 0.55);
        sprite.alpha = sprite.originalAlpha;
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

  private async renderPaths() {
    this.pathContainer.removeChildren();

    const promises: Array<Promise<Path[]>> = [];
    WaveController.Instance.getSpawnGroups().forEach((spawnGroup) => {
      promises.push(spawnGroup.getAsyncSpawnPoints());
    });

    const paths: Path[] = [];
    (await Promise.all(promises)).forEach((result: Path[]) =>
      paths.push(...result)
    );

    paths.forEach((path, index) => {
      const slicedPath = this.slicePath(path);
      const markers = Math.max(1, Math.floor(slicedPath.getLength() / 5));

      for (let i = 0; i < markers; i++) {
        this.pathContainer.addChild(
          new Marker(
            index * 2 + i * 5,
            slicedPath,
            this.container.assets![ATLAS].textures![AtlasTile.Entity]
          )
        );
      }
    });
  }

  private slicePath(path: Path) {
    let start: number;
    let end: number;

    for (let i = 0; i < path.getLength(); i++) {
      const tile = path.getTile(i);
      if (!tile.isDiscovered()) {
        start = i + 1;
      }

      if (
        tile.hasStaticEntity() &&
        BASE_ENTITIES.has(tile.getStaticEntity().getAgent().getType())
      ) {
        end = i;
        break;
      }
    }

    return path.slice(start!, end!);
  }

  public update(dt: number) {
    if (!this.visible) {
      return;
    }

    if (Manager.Instance.getIsStarted()) {
      this.pathContainer.removeChildren();
    } else {
      (this.pathContainer.children as Marker[]).forEach((marker) =>
        marker.move(dt)
      );
    }

    const [x, y] = Controller.Instance.getMouse(2);
    const newHoveredTile = this.surface.getTile(x, y);

    if (newHoveredTile === this.hoveredTile) {
      return;
    }

    if (this.hoveredTile) {
      this.towers.get(this.hoveredTile.getHash())?.forEach((sprite) => {
        sprite.texture =
          this.container.assets![ATLAS].textures![AtlasTile.Coverage];
        sprite.alpha = sprite.originalAlpha;
      });
    }

    if (newHoveredTile) {
      this.towers.get(newHoveredTile.getHash())?.forEach((sprite) => {
        sprite.texture =
          this.container.assets![ATLAS].textures![AtlasTile.ActiveCoverage];
        sprite.alpha = 0.7;
      });
    }

    this.hoveredTile = newHoveredTile;
  }
}

export { CoverageRenderer };
