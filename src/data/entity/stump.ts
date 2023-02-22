import Tile, { TileWithStaticEntity } from "../terrain/tile";
import { AgentCategory, EntityType } from "./constants";
import StaticEntity, { StaticAgent } from "./staticEntity";

class Stump implements StaticAgent {
  public static scale = 1;

  public entity: StaticEntity;
  public category = AgentCategory.Unknown;
  public renderData = {};

  constructor(private tile: Tile) {
    this.entity = new StaticEntity(tile.getX(), tile.getY(), this);
  }

  getType(): EntityType {
    return EntityType.Stump;
  }

  getTile() {
    return this.tile as TileWithStaticEntity;
  }

  updateTile(tile: Tile) {
    this.tile = tile;
  }

  isVisible() {
    return this.tile.isDiscovered();
  }
}

export default Stump;
