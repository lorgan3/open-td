import Manager from "../../manager";
import Tile from "../../terrain/tile";
import Entity, { AgentCategory, EntityType } from "../entity";
import { ITower } from ".";
import { IEnemy } from "../enemies";
import Rail from "../rail";

const RANGE = 30;
const COOLDOWN = 5000;
const DAMAGE = 100;

class Railgun implements ITower {
  public entity: Entity;
  public category = AgentCategory.Player;
  private cooldown = 0;

  constructor(private tile: Tile) {
    this.entity = new Entity(tile.getX(), tile.getY(), this);

    Manager.Instance.getSurface().forCircle(
      tile.getX(),
      tile.getY(),
      RANGE,
      (tile) => tile.addTower(this)
    );
  }

  tick(dt: number) {
    this.cooldown = Math.max(0, this.cooldown - dt);
  }

  fire(target: IEnemy) {
    this.cooldown = COOLDOWN;
    const projectile = new Rail(this.tile, target, DAMAGE);
    Manager.Instance.getSurface().spawn(projectile);

    return DAMAGE;
  }

  getCooldown() {
    return this.cooldown;
  }

  getType(): EntityType {
    return EntityType.Railgun;
  }
}

export default Railgun;