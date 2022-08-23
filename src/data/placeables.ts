import ElectricFence from "./entity/electricFence";
import { AgentClass, EntityType } from "./entity/entity";
import Fence from "./entity/fence";
import Freezer from "./entity/freezer";
import PowerPlant from "./entity/powerPlant";
import Radar from "./entity/radar";
import Flamethrower from "./entity/towers/flamethrower";
import Mortar from "./entity/towers/mortar";
import Railgun from "./entity/towers/railgun";
import Tower from "./entity/towers/tower";
import Wall from "./entity/wall";

export interface Placeable {
  name: string;
  htmlElement: string;
  entity?: AgentClass;
  entityType: EntityType;
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
  },
  {
    name: "Power plant",
    entity: PowerPlant,
    entityType: EntityType.PowerPlant,
    htmlElement: "🏭",
  },
];

export default placeables;
