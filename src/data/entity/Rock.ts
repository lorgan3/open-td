import Manager from "../manager";
import Tile from "../terrain/tile";
import Entity, { AgentCategory, EntityType, StaticAgent } from "./entity";

class Rock implements StaticAgent {
  public entity: Entity;
  public category = AgentCategory.Unknown;
  private hp = 50;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  getType(): EntityType {
    return EntityType.Rock;
  }

  getTile() {
    return this.tile;
  }

  updateTile(tile: Tile) {
    this.tile = tile;
  }

  hit(damage: number) {
    this.hp -= damage;

    if (this.hp <= 0) {
      Manager.Instance.getSurface().despawnStatic(this);
    }
  }

  isVisible() {
    return this.tile.isDiscovered();
  }
}

export default Rock;
