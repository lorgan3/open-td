import Tile from "../terrain/tile";
import Entity, { Agent, EntityType } from "./entity";

class Tower implements Agent {
  public entity: Entity;

  constructor(tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  getType(): EntityType {
    return EntityType.Tower;
  }
}

export default Tower;
