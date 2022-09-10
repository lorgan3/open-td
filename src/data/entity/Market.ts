import Manager from "../manager";
import { createStoneSurface } from "../terrain/fill";
import Tile, { TileWithStaticEntity } from "../terrain/tile";
import { AgentCategory, EntityType } from "./entity";
import StaticEntity, { StaticAgent } from "./staticEntity";

class Market implements StaticAgent {
  public static scale = 2;

  public entity: StaticEntity;
  public category = AgentCategory.Player;

  constructor(private tile: Tile) {
    this.entity = new StaticEntity(tile.getX(), tile.getY(), this);
  }

  spawn() {
    Manager.Instance.getBase().addPart(this);
    createStoneSurface(this.tile, 3);
  }

  despawn() {
    Manager.Instance.getBase().removePart(this);
  }

  getType(): EntityType {
    return EntityType.Market;
  }

  getTile() {
    return this.tile as TileWithStaticEntity;
  }

  updateTile(tile: Tile) {
    this.tile = tile;
  }

  hit(damage: number) {
    Manager.Instance.getBase().hit(damage);
  }

  isVisible() {
    return true;
  }
}

export default Market;
