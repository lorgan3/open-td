import Manager from "../manager";
import Tile from "../terrain/tile";
import Entity, { Agent, AgentCategory, EntityType } from "./entity";

class PowerPlant implements Agent {
  public entity: Entity;
  public category = AgentCategory.Player;
  public hp = 10;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  getType(): EntityType {
    return EntityType.PowerPlant;
  }

  getTile() {
    return this.tile;
  }

  getHp() {
    return this.hp;
  }

  spawn() {
    Manager.Instance.getPowerController().registerGenerator(this);
  }

  despawn() {
    Manager.Instance.getPowerController().removeGenerator(this);
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

export default PowerPlant;
