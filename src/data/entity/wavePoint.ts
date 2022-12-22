import Manager from "../controllers/manager";
import Tile from "../terrain/tile";
import { lerp } from "../util/math";
import { AgentCategory, EntityType } from "./constants";
import Entity, { Agent } from "./entity";
import { getCenter } from "./staticEntity";

class WavePoint implements Agent {
  public entity: Entity;
  public category = AgentCategory.Unknown;
  public renderData = {};

  private targetX = 0;
  private targetY = 0;
  private travelTime = 0;
  private time = 0;

  sourceX = 0;
  sourceY = 0;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX() + 0.5, tile.getY() + 0.5, this);
    this.sourceX = this.entity.getX();
    this.sourceY = this.entity.getY();
  }

  tick(dt: number) {
    if (this.travelTime > 0 && this.time < this.travelTime) {
      this.time += dt;
      const t = Math.min(1, this.time / this.travelTime);

      this.entity.setX(lerp(this.tile.getX(), this.targetX, t));
      this.entity.setY(lerp(this.tile.getY(), this.targetY, t));

      if (this.time >= this.travelTime) {
        Manager.Instance.getSurface().despawn(this);
      }
    }
  }

  discover() {
    const base = Manager.Instance.getBase();
    const [x, y] = getCenter(base);
    this.targetX = x;
    this.targetY = y;
    this.travelTime =
      Math.sqrt((x - this.tile.getX()) ** 2 + (y - this.tile.getY()) ** 2) *
      100;
  }

  getType(): EntityType {
    return EntityType.WavePoint;
  }

  isVisible() {
    return this.travelTime > 0;
  }
}

export default WavePoint;
