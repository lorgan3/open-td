import Tile from "../terrain/tile";
import { EntityType, RockType } from "./constants";
import Rock from "./rock";

class Rock3 extends Rock {
  constructor(tile: Tile) {
    super(tile);
    this.renderData.subType = RockType.Rock3;
  }

  getType(): EntityType {
    return EntityType.Rock3;
  }
}

export default Rock3;
