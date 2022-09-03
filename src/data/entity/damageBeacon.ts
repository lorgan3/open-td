import Manager from "../manager";

import Tile from "../terrain/tile";
import Entity, { AgentCategory, EntityType, StaticAgent } from "./entity";

class DamageBeacon implements StaticAgent {
  public entity: Entity;
  public category = AgentCategory.Player;
  private hp = 50;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  spawn() {
    Manager.Instance.getSurface()
      .getAdjacentTiles(this.tile)
      .forEach((tile) => tile.addLinkedAgent(this));
  }

  despawn() {
    Manager.Instance.getSurface()
      .getAdjacentTiles(this.tile)
      .forEach((tile) => tile.removeLinkedAgent(this));
  }

  getType(): EntityType {
    return EntityType.DamageBeacon;
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
    return true;
  }
}

export default DamageBeacon;
