import Surface from "./terrain/surface";

class Controller {
  constructor(private surface: Surface) {}

  public click(x: number, y: number) {
    const tile = this.surface.getTile(x, y);
    console.log("Clicked", tile);
  }
}

export default Controller;
