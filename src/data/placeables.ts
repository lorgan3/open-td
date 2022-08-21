import ElectricFence from "./entity/electricFence";
import { AgentClass, EntityType } from "./entity/entity";
import Fence from "./entity/fence";
import Freezer from "./entity/freezer";
import Flamethrower from "./entity/towers/flamethrower";
import Mortar from "./entity/towers/mortar";
import Railgun from "./entity/towers/railgun";
import Tower from "./entity/towers/tower";
import Wall from "./entity/wall";

export interface Placeable {
  name: string;
  cost: number;
  htmlElement: string;
  entity?: AgentClass;
  entityType: EntityType;
}

const placeables: Placeable[] = [
  {
    name: "Fence",
    cost: 1,
    entity: Fence,
    entityType: EntityType.Fence,
    htmlElement: "🥅",
  },
  {
    name: "Wall",
    cost: 3,
    entity: Wall,
    entityType: EntityType.Wall,
    htmlElement: "🚧",
  },
  {
    name: "Electric fence",
    cost: 9,
    entity: ElectricFence,
    entityType: EntityType.ElectricFence,
    htmlElement: "⚡",
  },
  {
    name: "Freezer",
    cost: 4,
    entity: Freezer,
    entityType: EntityType.Freezer,
    htmlElement: "❄️",
  },
  {
    name: "Tower",
    cost: 10,
    entity: Tower,
    entityType: EntityType.Tower,
    htmlElement: "🗼",
  },
  {
    name: "Mortar",
    cost: 30,
    entity: Mortar,
    entityType: EntityType.Mortar,
    htmlElement: "🛰️",
  },
  {
    name: "Flamethrower",
    cost: 15,
    entity: Flamethrower,
    entityType: EntityType.Flamethrower,
    htmlElement: "🧯",
  },
  {
    name: "Railgun",
    cost: 50,
    entity: Railgun,
    entityType: EntityType.Railgun,
    htmlElement: "🌡️",
  },
  {
    name: "Demolish",
    cost: 0,
    entityType: EntityType.None,
    htmlElement: "❌",
  },
];

export default placeables;
