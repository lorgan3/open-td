import Base from "../entity/base";
import { EntityType } from "../entity/constants";
import Mortar from "../entity/towers/mortar";
import Tower from "../entity/towers/tower";
import Flamethrower from "../entity/towers/flamethrower";
import Wall from "../entity/wall";
import Surface from "./surface";
import Tile from "./tile";
import Railgun from "../entity/towers/railgun";
import ElectricFence from "../entity/electricFence";
import Fence from "../entity/fence";
import Freezer from "../entity/freezer";
import Tree from "../entity/tree";
import Stump from "../entity/stump";
import Rock from "../entity/rock";
import Radar from "../entity/radar";
import PowerPlant from "../entity/powerPlant";
import Market from "../entity/market";
import Armory from "../entity/armory";
import SpeedBeacon from "../entity/speedBeacon";
import DamageBeacon from "../entity/damageBeacon";
import Laser from "../entity/towers/laser";
import Barracks from "../entity/barracks";
import Tesla from "../entity/towers/tesla";

export class SurfaceSchema {
  static currentVersion = 1;
  private static propertyCount = 4;

  private static tileTypeMap = {
    [EntityType.Tower]: Tower,
    [EntityType.Base]: Base,
    [EntityType.Wall]: Wall,
    [EntityType.Mortar]: Mortar,
    [EntityType.Flamethrower]: Flamethrower,
    [EntityType.Railgun]: Railgun,
    [EntityType.ElectricFence]: ElectricFence,
    [EntityType.Fence]: Fence,
    [EntityType.Freezer]: Freezer,
    [EntityType.Tree]: Tree,
    [EntityType.Stump]: Stump,
    [EntityType.Rock]: Rock,
    [EntityType.Radar]: Radar,
    [EntityType.PowerPlant]: PowerPlant,
    [EntityType.Armory]: Armory,
    [EntityType.Market]: Market,
    [EntityType.SpeedBeacon]: SpeedBeacon,
    [EntityType.DamageBeacon]: DamageBeacon,
    [EntityType.Laser]: Laser,
    [EntityType.Barracks]: Barracks,
    [EntityType.Tesla]: Tesla,
  };

  private tileBufferSize;
  constructor(private buffer: Uint8Array) {
    this.tileBufferSize = this.withEntities ? 2 : 1;
  }

  get version() {
    return this.buffer[0];
  }

  get width() {
    return this.buffer[1];
  }

  get height() {
    return this.buffer[2];
  }

  get withEntities() {
    return this.buffer[3];
  }

  getTile(index: number) {
    const offset = SurfaceSchema.propertyCount + index * this.tileBufferSize;
    const tile = new Tile(
      index % this.width,
      Math.floor(index / this.width),
      this.buffer[offset]
    );

    if (this.withEntities) {
      const constructor =
        SurfaceSchema.tileTypeMap[
          this.buffer[offset + 1] as keyof typeof SurfaceSchema.tileTypeMap
        ];

      if (constructor) {
        tile.setStaticEntity(new constructor(tile).entity);
      }
    }

    return tile;
  }

  static serializeSurface(surface: Surface, withEntities: boolean) {
    const tileBufferSize = withEntities ? 2 : 1;

    const buffer = new Uint8Array(
      SurfaceSchema.propertyCount + surface.map.length * tileBufferSize
    );

    buffer[0] = SurfaceSchema.currentVersion;
    buffer[1] = surface.getWidth();
    buffer[2] = surface.getHeight();
    buffer[3] = withEntities ? 1 : 0;
    for (let i = 0; i < surface.map.length; i++) {
      const tile = surface.map[i];
      const index = i * tileBufferSize + SurfaceSchema.propertyCount;

      buffer[index] = tile.getAltType();

      if (withEntities) {
        buffer[index + 1] =
          tile.getStaticEntity()?.getAgent().getType() ?? EntityType.None;
      }
    }

    return buffer;
  }
}
