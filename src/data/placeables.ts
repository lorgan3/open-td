import Armory from "./entity/Armory";
import SpeedBeacon from "./entity/speedBeacon";
import ElectricFence from "./entity/electricFence";
import { EntityType } from "./entity/entity";
import Fence from "./entity/fence";
import Freezer from "./entity/freezer";
import Market from "./entity/Market";
import PowerPlant from "./entity/powerPlant";
import Radar from "./entity/radar";
import Flamethrower from "./entity/towers/flamethrower";
import Mortar from "./entity/towers/mortar";
import Railgun from "./entity/towers/railgun";
import Tower from "./entity/towers/tower";
import Wall from "./entity/wall";
import DamageBeacon from "./entity/damageBeacon";
import Laser from "./entity/towers/Laser";
import { StaticAgent, StaticAgentStatics } from "./entity/staticEntity";
import Tile from "./terrain/tile";

export interface Placeable {
  name: string;
  htmlElement: string;
  entity?: (new (tile: Tile) => StaticAgent) & StaticAgentStatics;
  entityType: EntityType;
  isBasePart?: boolean;
}

export const FENCE: Placeable = {
  name: "Fence",
  entity: Fence,
  entityType: EntityType.Fence,
  htmlElement: "🥅",
};

export const WALL: Placeable = {
  name: "Wall",
  entity: Wall,
  entityType: EntityType.Wall,
  htmlElement: "🚧",
};

export const ELECTRIC_FENCE = {
  name: "Electric fence",
  entity: ElectricFence,
  entityType: EntityType.ElectricFence,
  htmlElement: "⚡",
};

export const FREEZER = {
  name: "Freezer",
  entity: Freezer,
  entityType: EntityType.Freezer,
  htmlElement: "❄️",
};

export const TOWER = {
  name: "Tower",
  entity: Tower,
  entityType: EntityType.Tower,
  htmlElement: "🗼",
};

export const MORTAR = {
  name: "Mortar",
  entity: Mortar,
  entityType: EntityType.Mortar,
  htmlElement: "🛰️",
};

export const FLAMETHROWER = {
  name: "Flamethrower",
  entity: Flamethrower,
  entityType: EntityType.Flamethrower,
  htmlElement: "🧯",
};

export const RAILGUN = {
  name: "Railgun",
  entity: Railgun,
  entityType: EntityType.Railgun,
  htmlElement: "🌡️",
};

export const DEMOLISH = {
  name: "Demolish",
  entityType: EntityType.None,
  htmlElement: "❌",
};

export const RADAR = {
  name: "Radar",
  entity: Radar,
  entityType: EntityType.Radar,
  htmlElement: "📡",
  isBasePart: true,
};

export const POWER_PLANT = {
  name: "Power plant",
  entity: PowerPlant,
  entityType: EntityType.PowerPlant,
  htmlElement: "🏭",
  isBasePart: true,
};

export const ARMORY = {
  name: "Armory",
  entity: Armory,
  entityType: EntityType.Armory,
  htmlElement: "🏰",
  isBasePart: true,
};

export const MARKET = {
  name: "Market",
  entity: Market,
  entityType: EntityType.Market,
  htmlElement: "🏪",
  isBasePart: true,
};

export const SPEED_BEACON = {
  name: "Speed Beacon",
  entity: SpeedBeacon,
  entityType: EntityType.SpeedBeacon,
  htmlElement: "⏰",
};

export const DAMAGE_BEACON = {
  name: "Damage Beacon",
  entity: DamageBeacon,
  entityType: EntityType.DamageBeacon,
  htmlElement: "🚨",
};

export const LASER = {
  name: "Laser",
  entity: Laser,
  entityType: EntityType.Laser,
  htmlElement: "🔭",
};

const placeables: Placeable[] = [
  DEMOLISH,
  FENCE,
  WALL,
  ELECTRIC_FENCE,
  FREEZER,
  TOWER,
  MORTAR,
  FLAMETHROWER,
  RAILGUN,
  RADAR,
  POWER_PLANT,
  ARMORY,
  MARKET,
  SPEED_BEACON,
  DAMAGE_BEACON,
  LASER,
];

export const placeableEntityTypes = new Set(
  placeables.map((placeable) => placeable.entityType)
);

export default placeables;
