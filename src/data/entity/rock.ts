import Manager from "../controllers/manager";
import Tile, { TileWithStaticEntity } from "../terrain/tile";
import { AgentCategory, EntityType, RockType } from "./constants";
import { RenderData } from "./entity";
import StaticEntity, { StaticAgent } from "./staticEntity";

class Rock implements StaticAgent {
  public static scale = 1;

  public entity: StaticEntity;
  public category = AgentCategory.Unknown;
  private hp = 30;
  public renderData: RenderData = {};

  constructor(private tile: Tile) {
    this.entity = new StaticEntity(tile.getX(), tile.getY(), this);
    this.renderData.subType = RockType.Rock1;
  }

  getType(): EntityType {
    return EntityType.Rock;
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
    return this.tile.isDiscovered();
  }
}

export default Rock;
