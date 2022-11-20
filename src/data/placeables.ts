import Armory from "./entity/armory";
import SpeedBeacon from "./entity/speedBeacon";
import ElectricFence from "./entity/electricFence";
import { EntityType } from "./entity/entity";
import Fence from "./entity/fence";
import Freezer from "./entity/freezer";
import Market from "./entity/market";
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
  description: string;
  htmlElement: string;
  entity?: (new (tile: Tile) => StaticAgent) & StaticAgentStatics;
  entityType: EntityType;
  isBasePart?: boolean;
  isRepeatable?: boolean;
  cost?: number;
}

export const FENCE: Placeable = {
  name: "Fence",
  description:
    "A simple fence that land-based enemies have to walk around. If the fence becomes too long however, they will climb over it. Fences are low to towers can shoot over them.",
  entity: Fence,
  entityType: EntityType.Fence,
  htmlElement: "🥅",
};

export const WALL: Placeable = {
  name: "Wall",
  description:
    "A large solid wall that land-based enemies have to walk around. A wall is equivalent to a tower that does not shoot meaning enemies will avoid them but will destroy them if left with no other option.",
  entity: Wall,
  entityType: EntityType.Wall,
  htmlElement: "🚧",
};

export const ELECTRIC_FENCE: Placeable = {
  name: "Electric fence",
  description:
    "Electric fences are similar to their normal counterpart but enemies are far less likely to climb over them. If they do they will also continuously receive damage, given that you have enough power stored.",
  entity: ElectricFence,
  entityType: EntityType.ElectricFence,
  htmlElement: "⚡",
};

export const FREEZER: Placeable = {
  name: "Freezer",
  description:
    "A large pad that slows down land-based enemies that walk over it. The pad does not repel or attract enemies so they still have to be guided to walk over it.",
  entity: Freezer,
  entityType: EntityType.Freezer,
  htmlElement: "❄️",
};

export const TOWER: Placeable = {
  name: "Tower",
  description:
    "The cheapest and most basic tower. It has poor range and deals little damage.",
  entity: Tower,
  entityType: EntityType.Tower,
  htmlElement: "🗼",
};

export const MORTAR: Placeable = {
  name: "Mortar",
  description:
    "A powerful tower with a large range that can shoot over obstacles. It also deals splash damage, hurting all enemies near the impact. Reload speed and travel time of the projectile is slow though.",
  entity: Mortar,
  entityType: EntityType.Mortar,
  htmlElement: "🛰️",
};

export const FLAMETHROWER: Placeable = {
  name: "Flamethrower",
  description:
    "A turret intended for close range combat. It continuously hurts a single enemy within range. Enemies that were lit on fire will also keep burning for a while.",
  entity: Flamethrower,
  entityType: EntityType.Flamethrower,
  htmlElement: "🧯",
};

export const RAILGUN: Placeable = {
  name: "Railgun",
  description:
    "A powerful tower with a large range that can pierce enemies. It shoots relatively fast and deals massive damage to an enemy and all enemies behind it at the cost of consuming power.",
  entity: Railgun,
  entityType: EntityType.Railgun,
  htmlElement: "🌡️",
};

export const DEMOLISH: Placeable = {
  name: "Sell",
  description:
    "Sell towers or blueprints. Blueprints and towers placed before the start of a wave are fully refunded. Other towers give back half their original cost when sold.",
  entityType: EntityType.None,
  htmlElement: "❌",
};

export const RADAR: Placeable = {
  name: "Radar",
  description:
    "A part of your base that exposes a large area in the direction that it was placed in. Exposed enemy bases are immediately neutralized when exposed by a radar.",
  entity: Radar,
  entityType: EntityType.Radar,
  htmlElement: "📡",
  isBasePart: true,
};

export const POWER_PLANT: Placeable = {
  name: "Power plant",
  description:
    "A part of your base that generates an amount power at the start of every wave. Power can be stored across waves and is consumed by various towers. More power plants will generate more power but there are diminishing returns.",
  entity: PowerPlant,
  entityType: EntityType.PowerPlant,
  htmlElement: "🏭",
  isBasePart: true,
};

export const ARMORY: Placeable = {
  name: "Armory",
  description:
    "A part of your base that regenerates hit points at the start of every wave. More armories will regenerate more hit points but there are diminishing returns.",
  entity: Armory,
  entityType: EntityType.Armory,
  htmlElement: "🏰",
  isBasePart: true,
};

export const MARKET: Placeable = {
  name: "Market",
  description:
    "A part of your base that increases the amount of money you get per killed enemy. More markets will increase the multiplier but there are diminishing returns.",
  entity: Market,
  entityType: EntityType.Market,
  htmlElement: "🏪",
  isBasePart: true,
};

export const SPEED_BEACON: Placeable = {
  name: "Speed Beacon",
  description:
    "A building that increases the reload speed of cardinally adjacent towers at the cost of some power for every shot fired. If there is no power (left) the towers will continue working as normal without a speed boost. Keep in mind that the beacon also blocks tower sight lines.",
  entity: SpeedBeacon,
  entityType: EntityType.SpeedBeacon,
  htmlElement: "⏰",
};

export const DAMAGE_BEACON: Placeable = {
  name: "Damage Beacon",
  description:
    "A building that increases the damage of cardinally adjacent towers at the cost of some power for every shot fired. If there is no power (left) the towers will continue working as normal without a damage boost. Keep in mind that the beacon also blocks tower sight lines.",
  entity: DamageBeacon,
  entityType: EntityType.DamageBeacon,
  htmlElement: "🚨",
};

export const LASER: Placeable = {
  name: "Laser",
  description:
    "A reasonably powerful tower that lights enemies on fire, similar to the flamethrower. It has a larger range but consumes power in order to fire.",
  entity: Laser,
  entityType: EntityType.Laser,
  htmlElement: "🔭",
};

export const EXCAVATOR: Placeable = {
  name: "Excavator",
  description: "Allows building over trees and rocks.",
  entityType: EntityType.Excavator,
  htmlElement: "🚜",
  cost: 1,
};

export const TERRAFORM: Placeable = {
  name: "Terraform",
  description:
    "Allows building over water, ice and enemy structures. Keep in mind a stone foundation is also built which replaces the original surface.",
  entityType: EntityType.Terraform,
  htmlElement: "🏗️",
  cost: 1,
};

export const CONVERT_MONEY_AMOUNT = 100;
export const CONVERT: Placeable = {
  name: "Convert",
  description: `Convert a wave point in a flat ${CONVERT_MONEY_AMOUNT} gold.`,
  entityType: EntityType.Convert,
  htmlElement: "🪙",
  isRepeatable: true,
  cost: 1,
};

export const WAVE_OVER_MULTIPLIER = 1.5;
export const EMERGENCY_RECHARGE: Placeable = {
  name: "Emerg. recharge",
  description: `Activate all existing power plants again to generate additional power. This can also be done during a wave, but doing it between waves is ${WAVE_OVER_MULTIPLIER} as efficient.`,
  entityType: EntityType.EmergencyRecharge,
  htmlElement: "🔌",
  isRepeatable: true,
  cost: 2,
};

export const EMERGENCY_REPAIR: Placeable = {
  name: "Emerg. repair",
  description: `Activate all existing armories again to generate additional base health. This can also be done during a wave, but doing it between waves is ${WAVE_OVER_MULTIPLIER} as efficient.`,
  entityType: EntityType.EmergencyRepair,
  htmlElement: "🛠",
  isRepeatable: true,
  cost: 3,
};

export enum Group {
  Construction = "Construction",
  Walls = "Walls",
  BasicBuildings = "Basic buildings",
  PoweredBuildings = "Powered Buildings",
  BaseBuildings = "Base Buildings",
  WildcardBuildings = "Wildcard Buildings",
  Abilities = "Abilities",
}

export const SECTIONS: Record<Group, Placeable[]> = {
  [Group.Construction]: [DEMOLISH, EXCAVATOR, TERRAFORM],
  [Group.Walls]: [FENCE, WALL, ELECTRIC_FENCE],
  [Group.BasicBuildings]: [TOWER, FLAMETHROWER, MORTAR],
  [Group.PoweredBuildings]: [POWER_PLANT, LASER, RAILGUN],
  [Group.BaseBuildings]: [ARMORY, RADAR, MARKET],
  [Group.WildcardBuildings]: [FREEZER, SPEED_BEACON, DAMAGE_BEACON],
  [Group.Abilities]: [CONVERT, EMERGENCY_RECHARGE, EMERGENCY_REPAIR],
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
