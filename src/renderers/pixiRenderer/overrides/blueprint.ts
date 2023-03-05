import { Sprite } from "pixi.js";
import BlueprintData from "../../../data/entity/blueprint";
import { EntityType } from "../../../data/entity/constants";
import { ATLAS, AtlasTile } from "../atlas";
import { BASE } from "../layer";
import { SCALE } from "../constants";
import { EntityRenderer } from "./types";
import { AssetsContainer } from "../assets/container";

const BLUEPRINT_MAP = new Map<EntityType, [string, string]>([
  [EntityType.Armory, [ATLAS, AtlasTile.BarracksBlueprint]],
  [EntityType.Barracks, [ATLAS, AtlasTile.BarracksBlueprint]],
  [EntityType.PowerPlant, [ATLAS, AtlasTile.PowerPlantBlueprint]],
  [EntityType.Radar, [ATLAS, AtlasTile.RadarBlueprint]],
  [EntityType.Market, [ATLAS, AtlasTile.MarketBlueprint]],
  [EntityType.DamageBeacon, [ATLAS, AtlasTile.DamageBeacon]],
  [EntityType.SpeedBeacon, [ATLAS, AtlasTile.SpeedBeacon]],
  [EntityType.Freezer, [ATLAS, AtlasTile.Tar]],
  [EntityType.Fence, [ATLAS, AtlasTile.FenceBlueprint]],
  [EntityType.Wall, [ATLAS, AtlasTile.WallBlueprint]],
  [EntityType.ElectricFence, [ATLAS, AtlasTile.FenceBlueprint]],
  [EntityType.Tower, [ATLAS, AtlasTile.TowerBlueprint]],
  [EntityType.Flamethrower, [ATLAS, AtlasTile.FlamethrowerBlueprint]],
  [EntityType.Mortar, [ATLAS, AtlasTile.MortarBlueprint]],
  [EntityType.Laser, [ATLAS, AtlasTile.LaserBlueprint]],
  [EntityType.Railgun, [ATLAS, AtlasTile.RailgunBlueprint]],
  [EntityType.Tesla, [ATLAS, AtlasTile.TeslaBlueprint]],
  [EntityType.None, [ATLAS, AtlasTile.None]],
]);

class Blueprint extends Sprite implements EntityRenderer {
  public static readonly layer = BASE;

  constructor(private data: BlueprintData, container: AssetsContainer) {
    const type = data.getPlaceable().entityType;

    if (!BLUEPRINT_MAP.has(type)) {
      throw new Error(`Missing blueprint sprite for ${type}`);
    }

    const [atlas, texture] = BLUEPRINT_MAP.get(type)!;
    super(container.assets![atlas].textures[texture]);

    if (type === EntityType.None) {
      this.scale.set(data.getScale());
    }

    this.alpha = 0.7;
    this.position.set(
      this.data.entity.getX() * SCALE,
      this.data.entity.getY() * SCALE
    );
  }

  sync() {}
}

export { Blueprint };
