import Tile from "../terrain/tile";
import Entity, { Agent, EntityType } from "./entity";

class Enemy implements Agent {
  public entity: Entity;

  constructor(tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  getType(): EntityType {
    return EntityType.Slime;
  }
}

export default Enemy;
