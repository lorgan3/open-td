import Manager from "../manager";
import Tile from "../terrain/tile";
import { IEnemy } from "./enemies";
import Entity, { AgentCategory, EntityType } from "./entity";
import { ITower } from "./towers";

const DAMAGE = 2;

class ElectricFence implements ITower {
  public entity: Entity;
  public category = AgentCategory.Player;
  private isEnabled = true;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
    tile.addTower(this);
  }

  getCooldown(): number {
    return this.isEnabled ? 0 : 1;
  }

  fire(target: IEnemy) {
    target.hit(DAMAGE);

    return DAMAGE;
  }

  spawn() {
    Manager.Instance.getPowerController().registerConsumer(this);
  }

  despawn() {
    Manager.Instance.getPowerController().removeConsumer(this);
    this.tile.removeTower(this);
  }

  getType(): EntityType {
    return EntityType.ElectricFence;
  }

  getTile() {
    return this.tile;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  isVisible() {
    return true;
  }
}

export default ElectricFence;
