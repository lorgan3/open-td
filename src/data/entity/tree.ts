import Manager from "../controllers/manager";
import Tile, { TileWithStaticEntity } from "../terrain/tile";
import { AgentCategory, EntityType } from "./constants";
import { RenderData } from "./entity";
import StaticEntity, { StaticAgent } from "./staticEntity";
import Stump from "./stump";

class Tree implements StaticAgent {
  public static scale = 1;

  public entity: StaticEntity;
  public category = AgentCategory.Unknown;
  private hp = 30;
  public renderData: RenderData = {};

  constructor(private tile: Tile) {
    this.entity = new StaticEntity(tile.getX(), tile.getY(), this);
  }

  getType(): EntityType {
    return EntityType.Tree;
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

      const stump = new Stump(this.tile);
      Manager.Instance.getSurface().spawnStatic(stump);
    }
  }

  isVisible() {
    return this.tile.isDiscovered();
  }
}

export default Tree;
