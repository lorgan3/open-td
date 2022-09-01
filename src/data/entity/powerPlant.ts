import Manager from "../manager";
import { createStoneSurface } from "../terrain/fill";
import Tile from "../terrain/tile";
import Entity, { AgentCategory, EntityType, StaticAgent } from "./entity";

class PowerPlant implements StaticAgent {
  public entity: Entity;
  public category = AgentCategory.Player;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  getType(): EntityType {
    return EntityType.PowerPlant;
  }

  getTile() {
    return this.tile;
  }

  updateTile(tile: Tile) {
    this.tile = tile;
  }

  spawn() {
    Manager.Instance.getBase().addPart(this);
    createStoneSurface(this.tile, 3);
  }

  despawn() {
    Manager.Instance.getBase().removePart(this);
  }

  hit(damage: number) {
    Manager.Instance.getBase().hit(damage);
  }

  isVisible() {
    return true;
  }
}

export default PowerPlant;
