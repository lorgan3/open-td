import { Placeable } from "../placeables";
import Tile from "../terrain/tile";
import Entity, { Agent, AgentCategory, EntityType } from "./entity";

class Blueprint implements Agent {
  public entity: Entity;
  public category = AgentCategory.Player;
  public renderData = {};

  constructor(
    private tile: Tile,
    private placeable: Placeable,
    private scaleOverride?: number
  ) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  getType(): EntityType {
    return EntityType.Blueprint;
  }

  getTile() {
    return this.tile;
  }

  isVisible() {
    return true;
  }

  getPlaceable() {
    return this.placeable;
  }

  getScale() {
    return this.placeable.entity?.scale || this.scaleOverride || 1;
  }

  isDelete() {
    return this.placeable.entityType === EntityType.None;
  }

  isBasePart() {
    return !!this.placeable.isBasePart;
  }
}

export default Blueprint;

export const isBlueprint = (agent: Agent): agent is Blueprint => {
  return agent.getType() === EntityType.Blueprint;
};
