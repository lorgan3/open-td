import { Loader, Sprite } from "pixi.js";
import { EntityRenderer } from ".";
import BlueprintData from "../../../data/entity/Blueprint";

import { EntityType } from "../../../data/entity/entity";
import { ATLAS, AtlasTile } from "../atlas";
import { BASE } from "../layer";
import { SCALE } from "../renderer";

const BLUEPRINT_MAP = new Map<EntityType, [string, string]>([
  [EntityType.Armory, ["buildings", "buildings1.png"]],
  [EntityType.PowerPlant, ["buildings", "buildings2.png"]],
  [EntityType.Radar, ["buildings", "buildings3.png"]],
  [EntityType.Market, ["buildings", "buildings4.png"]],
  [EntityType.DamageBeacon, ["buildings", "buildings5.png"]],
  [EntityType.SpeedBeacon, ["buildings", "buildings6.png"]],
  [EntityType.Freezer, ["buildings", "buildings12.png"]],
  [EntityType.Fence, [ATLAS, AtlasTile.Fence]],
  [EntityType.Wall, ["buildings", "buildings13.png"]],
  [EntityType.ElectricFence, [ATLAS, AtlasTile.ElectricFence]],
  [EntityType.Tower, ["turret", "turret0.png"]],
  [EntityType.Flamethrower, ["flamethrower", "flamethrower0.png"]],
  [EntityType.Mortar, ["mortar", "mortar0.png"]],
  [EntityType.Laser, ["laser", "laser0.png"]],
  [EntityType.Railgun, ["railgun", "railgun0.png"]],
]);

class Blueprint extends Sprite implements EntityRenderer {
  public static readonly layer = BASE;

  constructor(private data: BlueprintData, loader: Loader) {
    const type = data.getPlaceable().entityType;

    if (!BLUEPRINT_MAP.has(type)) {
      throw new Error(`Missing blueprint sprite for ${type}`);
    }

    const [atlas, texture] = BLUEPRINT_MAP.get(type)!;
    super(loader.resources[atlas].spritesheet!.textures[texture]);

    this.alpha = 0.7;
    this.position.set(
      this.data.entity.getX() * SCALE,
      this.data.entity.getY() * SCALE
    );
  }

  sync() {}
}

export { Blueprint };
