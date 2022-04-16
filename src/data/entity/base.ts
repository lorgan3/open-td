import Tile from "../terrain/tile";
import Entity, { Agent, AgentCategory, EntityType } from "./entity";

class Base implements Agent {
  public entity: Entity;
  public category = AgentCategory.Player;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  getType(): EntityType {
    return EntityType.Base;
  }

  getTile() {
    return this.tile;
  }
}

export default Base;
