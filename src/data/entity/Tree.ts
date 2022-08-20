import Manager from "../manager";
import Tile from "../terrain/tile";
import Entity, { Agent, AgentCategory, EntityType } from "./entity";

class Tree implements Agent {
  public entity: Entity;
  public category = AgentCategory.Player;
  private hp = 50;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  getType(): EntityType {
    return EntityType.Tree;
  }

  getTile() {
    return this.tile;
  }

  hit(damage: number) {
    this.hp -= damage;

    if (this.hp <= 0) {
      Manager.Instance.getSurface().despawnStatic(this);
    }
  }

}

export default Tree;
