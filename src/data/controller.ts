import Enemy from "./entity/enemy";
import PathFinder from "./terrain/pathfinder";
import Surface from "./terrain/surface";

class Controller {
  private pathfinder: PathFinder;

  constructor(private surface: Surface) {
    this.pathfinder = new PathFinder(surface);
  }

  public click(x: number, y: number) {
    const tile = this.surface.getTile(x, y);
    console.log("Clicked", tile);

    if (tile) {
      const enemy = new Enemy(tile);

      enemy.setPath(
        this.pathfinder.getPath(tile, this.surface.getTile(60, 50)!)!
      );
      this.surface.spawn(enemy);
    }
  }
}

export default Controller;
