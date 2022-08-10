import Manager from "../manager";
import Tile from "../terrain/tile";
import { IEnemy } from "./enemies";
import Entity, { Agent, AgentCategory, EntityType } from "./entity";

const SPEED = 0.01;
const ARC_HEIGHT = 5;
const RANGE = 2;
const RANGE_SQUARED = RANGE * RANGE;

class Rocket implements Agent {
  public entity: Entity;
  public category = AgentCategory.Unknown;

  private targetX: number;
  private targetY: number;

  private time = 0;
  private travelTime: number;

  constructor(
    private tile: Tile,
    private target: IEnemy,
    private damage: number
  ) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);

    const xDiff = tile.getX() - target.entity.getX();
    const yDiff = tile.getY() - target.entity.getY();
    const dist = ARC_HEIGHT * 2 + Math.sqrt(xDiff * xDiff + yDiff * yDiff);
    this.travelTime = dist / SPEED;

    const index = this.target.getPath().getFuturePosition(this.travelTime);
    const { x, y } = target.getPath().getCoordinates(index);
    this.targetX = x;
    this.targetY = y;
  }

  tick(dt: number) {
    if (this.time >= this.travelTime) {
      Manager.Instance.getSurface().despawn(this);
      this.target.hit(this.damage);

      [
        ...Manager.Instance.getSurface().getEntitiesForCategory(
          AgentCategory.Enemy
        ),
      ]
        .filter((enemy) => {
          const diffX = enemy.getX() - this.entity.getX();
          const diffY = enemy.getY() - this.entity.getY();
          return diffX * diffX + diffY * diffY < RANGE_SQUARED;
        })
        .forEach((enemy) => (enemy.getAgent() as IEnemy).hit(this.damage));
    }

    this.time = Math.min(this.time + dt, this.travelTime);
    const t = this.time / this.travelTime;
    this.entity.setX((this.targetX - this.tile.getX()) * t + this.tile.getX());

    const arc = Math.sin(t * Math.PI) * ARC_HEIGHT;
    this.entity.setY(
      (this.targetY - this.tile.getY()) * t + this.tile.getY() - arc
    );
  }

  getType(): EntityType {
    return EntityType.Bullet;
  }

  getTile() {
    return this.tile;
  }
}

export default Rocket;
