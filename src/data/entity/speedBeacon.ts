import Manager from "../manager";
import Tile, { TileWithStaticEntity } from "../terrain/tile";
import { AgentCategory, EntityType } from "./entity";
import StaticEntity, { StaticAgent } from "./staticEntity";

class SpeedBeacon implements StaticAgent {
  public static scale = 2;

  public entity: StaticEntity;
  public category = AgentCategory.Player;
  private hp = 50;

  constructor(private tile: Tile) {
    this.entity = new StaticEntity(tile.getX(), tile.getY(), this);
  }

  spawn() {
    Manager.Instance.getSurface()
      .getAdjacentTiles(this.tile, SpeedBeacon.scale)
      .forEach((tile) => tile.addLinkedAgent(this));
  }

  despawn() {
    Manager.Instance.getSurface()
      .getAdjacentTiles(this.tile, SpeedBeacon.scale)
      .forEach((tile) => tile.removeLinkedAgent(this));
  }

  getType(): EntityType {
    return EntityType.SpeedBeacon;
  }

  getTile() {
    return this.tile as TileWithStaticEntity;
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

export default SpeedBeacon;
