import { Placeable } from "../placeables";
import Tile from "../terrain/tile";
import Entity, { Agent, AgentCategory, EntityType } from "./entity";

class Blueprint implements Agent {
  public entity: Entity;
  public category = AgentCategory.Player;

  constructor(private tile: Tile, private placeable: Placeable) {
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

  isDelete() {
    return this.placeable.entityType === EntityType.None;
  }
}

export default Blueprint;
