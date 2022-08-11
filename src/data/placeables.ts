import { AgentClass, EntityType } from "./entity/entity";
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

const createEmojiSvg = (emoji: string) => {
  const svg = document.createElement("svg");
  svg.setAttribute("viewBox", "0 0 12 14");
  svg.setAttribute("width", "100");
  svg.setAttribute("height", "100");

  const text = document.createElement("text");
  text.setAttribute("y", "12");
  text.textContent = emoji;

  svg.appendChild(text);
  return svg.outerHTML;
};

const placeables: Placeable[] = [
  {
    name: "Wall",
    cost: 1,
    entity: Wall,
    entityType: EntityType.Wall,
    htmlElement: createEmojiSvg("🚧"),
  },
  {
    name: "Tower",
    cost: 10,
    entity: Tower,
    entityType: EntityType.Tower,
    htmlElement: createEmojiSvg("🗼"),
  },
  {
    name: "Mortar",
    cost: 30,
    entity: Mortar,
    entityType: EntityType.Mortar,
    htmlElement: createEmojiSvg("🛰"),
  },
  {
    name: "Flamethrower",
    cost: 15,
    entity: Flamethrower,
    entityType: EntityType.Flamethrower,
    htmlElement: createEmojiSvg("🧯"),
  },
  {
    name: "Railgun",
    cost: 50,
    entity: Railgun,
    entityType: EntityType.Railgun,
    htmlElement: createEmojiSvg("🌡"),
  },
  {
    name: "Demolish",
    cost: 0,
    entityType: EntityType.None,
    htmlElement: createEmojiSvg("❌"),
  },
];

export default placeables;
