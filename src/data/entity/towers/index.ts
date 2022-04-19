import { IEnemy } from "../enemies";
import { Agent } from "../entity";

export interface ITower extends Agent {
  getCooldown(): number;
  fire(target: IEnemy): number;
}
