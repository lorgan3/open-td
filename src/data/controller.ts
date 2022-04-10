import Tower from "./entity/tower";
import Surface from "./terrain/surface";

class Controller {
  constructor(private surface: Surface) {}

  public click(x: number, y: number) {
    const tile = this.surface.getTile(x, y);
    console.log("Clicked", tile);

    if (tile) {
      const tower = new Tower(tile);
      this.surface.spawnStatic(tower);
    }
  }
}

export default Controller;
