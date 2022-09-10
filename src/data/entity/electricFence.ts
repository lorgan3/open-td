import Manager from "../manager";
import Tile, { TileWithStaticEntity } from "../terrain/tile";
import { IEnemy } from "./enemies";
import Entity, { AgentCategory, EntityType } from "./entity";
import StaticEntity from "./staticEntity";
import { ITower } from "./towers";

const DAMAGE = 0.125;

class ElectricFence implements ITower {
  public entity: StaticEntity;
  public category = AgentCategory.Player;
  private isEnabled = true;

  constructor(private tile: Tile) {
    this.entity = new StaticEntity(tile.getX(), tile.getY(), this);
    tile.addTower(this);
  }

  getCooldown(): number {
    return this.isEnabled ? 0 : 1;
  }

  fire(target: IEnemy, dt: number) {
    if (Manager.Instance.consumeContinuous(this, dt)) {
      return 0;
    }

    const damage = DAMAGE * dt;
    target.hit(damage);

    return damage;
  }

  despawn() {
    this.tile.removeTower(this);
  }

  getType(): EntityType {
    return EntityType.ElectricFence;
  }

  getTile() {
    return this.tile as TileWithStaticEntity;
  }

  updateTile(tile: Tile) {
    this.tile = tile;
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
