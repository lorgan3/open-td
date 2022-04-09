import { DEFAULT_COSTS } from "../terrain/pathfinder";
import Tile from "../terrain/tile";
import Entity, { Agent, EntityType } from "./entity";

class Enemy implements Agent {
  public entity: Entity;
  private path: Tile[] = [];
  private pathIndex = 0;

  public speed = 0.1;

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
        return;
      }

      const step = this.pathIndex % 1;
      const start = this.pathIndex | 0;
      const from = this.path[start];

      let end =
        (this.pathIndex + this.speed / (DEFAULT_COSTS[from.getType()] ?? 1)) |
        0;
      if (start === end) {
        end++;
      }
      if (end >= this.path.length - 1) {
        end = this.path.length - 1;
      }

      const to = this.path[end];
      const x = (to.getX() - from.getX()) * step + from.getX();
      const y = (to.getY() - from.getY()) * step + from.getY();

      this.entity.setX(x);
      this.entity.setY(y);

      const xDiff = to.getX() - x;
      const yDiff = to.getY() - y;
      this.entity.setRotation(
        (-Math.atan(xDiff / yDiff) * 180) / Math.PI + 180
      );

      const speed =
        this.speed /
        (DEFAULT_COSTS[step > 0.5 ? to.getType() : from.getType()] ?? 1);
      this.pathIndex += speed;
    }
  }
}

export default Enemy;
