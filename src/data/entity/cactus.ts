import Tile from "../terrain/tile";
import { EntityType, TreeType } from "./constants";
import Tree from "./tree";

class Cactus extends Tree {
  constructor(tile: Tile) {
    super(tile);
    this.renderData.subType = TreeType.Cactus;
  }

  getType(): EntityType {
    return EntityType.Cactus;
  }
}

export default Cactus;
