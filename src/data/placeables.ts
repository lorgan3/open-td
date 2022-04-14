import { Agent, EntityType } from "./entity/entity";
import Tower from "./entity/tower";
import Tile, { TileType } from "./terrain/tile";

interface _placable {
  name: string;
  cost: number;
  htmlElement: string;
}

interface PlaceableTile extends _placable {
  tileType: TileType;
}

interface PlaceableEntity extends _placable {
  entity: new (tile: Tile) => Agent;
  entityType: EntityType;
}

export type Placeable = PlaceableTile | PlaceableEntity;

export const isPlaceableTile = (
  placeable: Placeable
): placeable is PlaceableTile => {
  return "tileType" in placeable;
};

export const isPlaceableEntity = (
  placeable: Placeable
): placeable is PlaceableEntity => {
  return "entityType" in placeable;
};

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
    tileType: TileType.Wall,
    htmlElement: createEmojiSvg("🚧"),
  },
  {
    name: "Tower",
    cost: 10,
    entity: Tower,
    entityType: EntityType.Tower,
    htmlElement: createEmojiSvg("🗼"),
  },
];

export default placeables;
