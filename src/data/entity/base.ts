import Tile from "../terrain/tile";
import Entity, { Agent, EntityType } from "./entity";

class Base implements Agent {
  public entity: Entity;

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
