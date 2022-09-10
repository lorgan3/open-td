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

const placeables: Placeable[] = [
  {
    name: "Fence",
    entity: Fence,
    entityType: EntityType.Fence,
    htmlElement: "🥅",
  },
  {
    name: "Wall",
    entity: Wall,
    entityType: EntityType.Wall,
    htmlElement: "🚧",
  },
  {
    name: "Electric fence",
    entity: ElectricFence,
    entityType: EntityType.ElectricFence,
    htmlElement: "⚡",
  },
  {
    name: "Freezer",
    entity: Freezer,
    entityType: EntityType.Freezer,
    htmlElement: "❄️",
  },
  {
    name: "Tower",
    entity: Tower,
    entityType: EntityType.Tower,
    htmlElement: "🗼",
  },
  {
    name: "Mortar",
    entity: Mortar,
    entityType: EntityType.Mortar,
    htmlElement: "🛰️",
  },
  {
    name: "Flamethrower",
    entity: Flamethrower,
    entityType: EntityType.Flamethrower,
    htmlElement: "🧯",
  },
  {
    name: "Railgun",
    entity: Railgun,
    entityType: EntityType.Railgun,
    htmlElement: "🌡️",
  },
  {
    name: "Demolish",
    entityType: EntityType.None,
    htmlElement: "❌",
  },
  {
    name: "Radar",
    entity: Radar,
    entityType: EntityType.Radar,
    htmlElement: "📡",
    isBasePart: true,
  },
  {
    name: "Power plant",
    entity: PowerPlant,
    entityType: EntityType.PowerPlant,
    htmlElement: "🏭",
    isBasePart: true,
  },
  {
    name: "Armory",
    entity: Armory,
    entityType: EntityType.Armory,
    htmlElement: "🏰",
    isBasePart: true,
  },
  {
    name: "Market",
    entity: Market,
    entityType: EntityType.Market,
    htmlElement: "🏪",
    isBasePart: true,
  },
  {
    name: "Speed Beacon",
    entity: SpeedBeacon,
    entityType: EntityType.SpeedBeacon,
    htmlElement: "⏰",
  },
  {
    name: "Damage Beacon",
    entity: DamageBeacon,
    entityType: EntityType.DamageBeacon,
    htmlElement: "🚨",
  },
  {
    name: "Laser",
    entity: Laser,
    entityType: EntityType.Laser,
    htmlElement: "🔭",
  },
];

export const placeableEntityTypes = new Set(
  placeables.map((placeable) => placeable.entityType)
);

export default placeables;
