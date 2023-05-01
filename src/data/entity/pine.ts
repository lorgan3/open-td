import Tile from "../terrain/tile";
import { EntityType, TreeType } from "./constants";
import Tree from "./tree";

class Pine extends Tree {
  constructor(tile: Tile) {
    super(tile);
    this.renderData.subType = TreeType.Pine;
  }

  getType(): EntityType {
    return EntityType.Pine;
  }
}

export default Pine;
