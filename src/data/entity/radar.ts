import Manager from "../manager";
import Tile from "../terrain/tile";
import Entity, { AgentCategory, EntityType, StaticAgent } from "./entity";

class Radar implements StaticAgent {
  public entity: Entity;
  public category = AgentCategory.Player;
  public hp = 100;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  getType(): EntityType {
    return EntityType.Radar;
  }

  getTile() {
    return this.tile;
  }

  updateTile(tile: Tile) {
    this.tile = tile;
  }

  getHp() {
    return this.hp;
  }

  spawn() {
    Manager.Instance.getVisibilityController().registerAgent(this);
  }

  despawn() {
    Manager.Instance.getVisibilityController().removeAgent(this);
  }

  hit(damage: number) {
    this.hp -= damage;

    if (this.hp <= 0) {
      Manager.Instance.getSurface().despawnStatic(this);
    }

    Manager.Instance.triggerStatUpdate();
  }

  isVisible() {
    return true;
  }
}

export default Radar;
