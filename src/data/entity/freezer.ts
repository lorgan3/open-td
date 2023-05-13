import Manager from "../controllers/manager";
import { TileType } from "../terrain/constants";
import Tile, { TileWithStaticEntity } from "../terrain/tile";
import { AgentCategory, EntityType } from "./constants";
import StaticEntity, { StaticAgent } from "./staticEntity";

class Freezer implements StaticAgent {
  public static scale = 2;

  public entity: StaticEntity;
  public category = AgentCategory.Player;
  public renderData = {};

  constructor(private tile: Tile) {
    this.entity = new StaticEntity(tile.getX(), tile.getY(), this);
  }

  spawn() {
    const tiles: Tile[] = [];
    Manager.Instance.getSurface()
      .getEntityTiles(this)
      .forEach((tile) => {
        tiles.push(new Tile(tile.getX(), tile.getY(), TileType.Freezer));
      });
    Manager.Instance.getSurface().setTiles(tiles);
  }

  despawn() {
    const tiles: Tile[] = Manager.Instance.getSurface()
      .getEntityTiles(this)
      .map((tile, i) => new Tile(tile.getX(), tile.getY(), TileType.Dirt));

    Manager.Instance.getSurface().setTiles(tiles);
  }

  getType(): EntityType {
    return EntityType.Freezer;
  }

  getTile() {
    return this.tile as TileWithStaticEntity;
  }

  updateTile(tile: Tile) {
    this.tile = tile;
  }

  isVisible() {
    return true;
  }
}

export default Freezer;
