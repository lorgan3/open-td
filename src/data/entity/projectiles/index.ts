import { IEnemy } from "../enemies";
import { getCenter, StaticAgent } from "../staticEntity";
import { ITower } from "../towers";

export abstract class Projectile {
  protected source!: ITower;
  protected target!: IEnemy;

  protected sourceX!: number;
  protected sourceY!: number;
  protected targetX!: number;
  protected targetY!: number;
  protected travelTime!: number;
}

export function aim(this: Projectile, speed: number, delay = 0) {
  const [cx, cy] = getCenter(this.source);
  this.sourceX = cx;
  this.sourceY = cy;

  // This requires the projectile to travel fast enough as this does not consider that the travel time changes as the target moves.
  const xDiff = cx - this.target.entity.getX() + 0.5;
  const yDiff = cy - this.target.entity.getY() + 0.5;
  const dist = Math.sqrt(xDiff * xDiff + yDiff * yDiff) + delay;
  this.travelTime = dist / speed;

  const index = this.target.AI.getFuturePosition(this.travelTime);

  const { x, y } = this.target.getPath().getCoordinates(index);
  this.targetX = x;
  this.targetY = y;
}
