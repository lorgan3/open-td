import Manager from "../manager";
import { DEFAULT_COSTS } from "../terrain/pathfinder";
import Tile from "../terrain/tile";
import Entity, { Agent, EntityType } from "./entity";
import { getPathSection } from "./util";

class Enemy implements Agent {
  public entity: Entity;
  private path: Tile[] = [];
  private pathIndex = 0;

  public speed = 0.5;

  constructor(tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);
  }

  getType(): EntityType {
    return EntityType.Slime;
  }

  setPath(tiles: Tile[]) {
    this.path = tiles;
    this.pathIndex = 0;
  }

  animate() {
    if (this.path.length) {
      if (this.pathIndex >= this.path.length - 1) {
        const to = this.path[this.path.length - 1];
        this.entity.setX(to.getX());
        this.entity.setY(to.getY());
        this.path = [];

        Manager.Instance.getSurface().despawn(this);
        return;
      }

      const { from, to, step } = getPathSection(
        this.path,
        this.pathIndex,
        this.speed,
        DEFAULT_COSTS
      );
      this.entity.move(from, to, step);

      this.pathIndex +=
        this.speed /
        (DEFAULT_COSTS[step > 0.5 ? to.getType() : from.getType()] ?? 1);
    }
  }
}

export default Enemy;
