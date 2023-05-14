import Base from "../entity/base";
import { EntityType } from "../entity/constants";
import Mortar from "../entity/towers/mortar";
import Tower from "../entity/towers/tower";
import Flamethrower from "../entity/towers/flamethrower";
import Wall from "../entity/wall";
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
import Pine from "../entity/pine";
import Cactus from "../entity/cactus";
import Rock2 from "../entity/rock2";
import Rock3 from "../entity/rock3";
import Tile from "./tile";
import StaticEntity from "../entity/staticEntity";

const TILE_TYPE_MAP = {
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
  [EntityType.Pine]: Pine,
  [EntityType.Cactus]: Cactus,
  [EntityType.Stump]: Stump,
  [EntityType.Rock]: Rock,
  [EntityType.Rock2]: Rock2,
  [EntityType.Rock3]: Rock3,
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

const staticEntityConstructor = (
  type: EntityType,
  tile: Tile
): StaticEntity | null => {
  const constructor = TILE_TYPE_MAP[type as keyof typeof TILE_TYPE_MAP];

  if (!constructor) {
    return null;
  }

  return new constructor(tile).entity;
};

export default staticEntityConstructor;
