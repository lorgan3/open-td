import Manager from "../manager";
import { createStoneSurface } from "../terrain/fill";
import Tile from "../terrain/tile";
import Entity, { Agent, AgentCategory, EntityType } from "./entity";

class Armory implements Agent {
  public entity: Entity;
  public category = AgentCategory.Player;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  spawn() {
    Manager.Instance.getBase().addPart(this.tile);
  }

  despawn() {
    Manager.Instance.getBase().removePart(this.tile);
  }

  getType(): EntityType {
    return EntityType.Armory;
  }

  getTile() {
    return this.tile;
  }

  hit(damage: number) {
    Manager.Instance.getBase().hit(damage);
  }

  isVisible() {
    return true;
  }
}

export default Armory;
