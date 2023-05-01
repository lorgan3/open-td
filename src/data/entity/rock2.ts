import Tile from "../terrain/tile";
import { EntityType, RockType } from "./constants";
import Rock from "./rock";

class Rock2 extends Rock {
  constructor(tile: Tile) {
    super(tile);
    this.renderData.subType = RockType.Rock2;
  }

  getType(): EntityType {
    return EntityType.Rock2;
  }
}

export default Rock2;
