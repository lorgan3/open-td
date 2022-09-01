import Tile from "../terrain/tile";
import Entity, { AgentCategory, EntityType, StaticAgent } from "./entity";

class Wall implements StaticAgent {
  public entity: Entity;
  public category = AgentCategory.Player;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  getType(): EntityType {
    return EntityType.Wall;
  }

  getTile() {
    return this.tile;
  }

  updateTile(tile: Tile) {
    this.tile = tile;
  }

  isVisible() {
    return true;
  }
}

export default Wall;
