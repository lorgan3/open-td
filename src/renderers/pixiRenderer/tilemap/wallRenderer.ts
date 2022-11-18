import { CompositeTilemap } from "@pixi/tilemap";
import { Loader } from "pixi.js";
import { EntityType } from "../../../data/entity/entity";
import { getScale } from "../../../data/entity/staticEntity";
import Surface from "../../../data/terrain/surface";
import Tile from "../../../data/terrain/tile";
import { SCALE } from "../renderer";
import { wallCoordinates, wallSpritePadding, wallTypes } from "./constants";

class WallRenderer {
  constructor(
    private loader: Loader,
    private tilemap: CompositeTilemap,
    private surface: Surface
  ) {
    loader.add("fences", `${import.meta.env.BASE_URL}tiles/fenceCombined.json`);
    loader.add("wall", `${import.meta.env.BASE_URL}tiles/bigWall.json`);
  }

  private getWallSprite(type: EntityType, index: number) {
    switch (type) {
      case EntityType.Fence:
        return this.loader.resources["fences"].textures![
          `fenceCombined${index}.png`
        ];

      case EntityType.ElectricFence:
        return this.loader.resources["fences"].textures![
          `fenceCombined${9 + index}.png`
        ];

      case EntityType.Wall:
        return this.loader.resources["wall"].textures![`bigWall${index}.png`];

      default:
        throw new Error("unknown wall type");
    }
  }

  public render(tile: Tile) {
    const agent = tile.getStaticEntity()!.getAgent();
    const type = agent.getType();
    const scale = getScale(agent);

    let connections = 0;
    let matchedX = 0;
    let matchedY = 0;
    let skipDiagonals = false;

    wallCoordinates[scale].forEach(([x, y], index) => {
      // Only make diagonal connections if there aren't already cardinal connections there.
      if (index > 3 && (skipDiagonals || x === matchedX || y === matchedY)) {
        return;
      }

      const neighbor = this.surface.getTile(tile.getX() + x, tile.getY() + y);
      if (
        neighbor &&
        wallTypes.has(neighbor.getType()) &&
        getScale(neighbor.getStaticEntity()!.getAgent()) === scale
      ) {
        // Store some state to know when to make diagonal connections.
        if (index <= 3) {
          if ((matchedX && x) || (matchedY && y)) {
            skipDiagonals = true;
          } else {
            matchedX = matchedX || x;
            matchedY = matchedY || y;
          }
        }

        this.tilemap.tile(
          this.getWallSprite(type, index),
          tile.getX() * SCALE - wallSpritePadding * scale,
          tile.getY() * SCALE - wallSpritePadding * scale
        );
        connections++;
      }
    });

    // If there are are less than 2 connections, render a tower as well (because the whole tile is covered by a wall)
    if (connections < 2) {
      this.tilemap.tile(
        this.getWallSprite(type, 8),
        tile.getX() * SCALE - wallSpritePadding * scale,
        tile.getY() * SCALE - wallSpritePadding * scale
      );
    }
  }
}

export { WallRenderer };
